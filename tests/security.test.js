import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOrderItems,
  sanitizeCart,
  validateAddress,
  validateProduct,
  validateReview,
  validQuantity,
  safeRedirect,
  orderTotals,
} from '../src/lib/validation.js';
import { createConfig } from '../src/config.js';
import { sessionUser, signInStep } from '../src/auth/session.js';
import { enterDemo, fetchAuthSession, signOut } from '../src/auth/client.js';
import { authHeaders } from '../src/lib/http.js';
import { placeOrder } from '../src/lib/placeOrder.js';

const products = [
  { id: 'sample', name: 'Sample shirt', price: 100, sizes: ['M'], image: ['/sample.png'] },
];
const address = {
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@example.invalid',
  phone: '0000000000',
  street: 'Example Street',
  city: 'Demo City',
  state: 'Demo Region',
  zip: '00000',
  country: 'Demo Country',
};
test('valid cart builds expected totals in MAD', () => {
  const items = buildOrderItems({ sample: { M: 2 } }, products);
  assert.deepEqual(orderTotals(items), {
    subtotal: 200,
    shipping: 50,
    total: 250,
    currency: 'MAD',
  });
});
for (const qty of [-2, 0, 0.5, 100, Infinity, NaN, '2']) {
  test(`reject invalid quantity ${String(qty)}`, () => {
    assert.equal(validQuantity(qty), false);
    assert.throws(() => buildOrderItems({ sample: { M: qty } }, products));
  });
}
test('reject unknown product and unavailable size', () => {
  assert.throws(() => buildOrderItems({ unknown: { M: 1 } }, products));
  assert.throws(() => buildOrderItems({ sample: { XL: 1 } }, products));
});
test('reject empty carts and non-positive product prices', () => {
  assert.throws(() => buildOrderItems({}, products));
  assert.throws(() => buildOrderItems({ sample: { M: 1 } }, [{ ...products[0], price: 0 }]));
});
test('sanitize persisted cart shape and prototype keys', () => {
  assert.deepEqual(sanitizeCart(null), {});
  assert.deepEqual(sanitizeCart([]), {});
  assert.deepEqual(sanitizeCart(JSON.parse('{"__proto__":{"M":1},"sample":{"M":2,"L":-1}}')), {
    sample: { M: 2 },
  });
  assert.equal({}.M, undefined);
});
test('validate address, email and phone', () => {
  assert.deepEqual(validateAddress(address), address);
  assert.throws(() => validateAddress({ ...address, email: 'invalid' }));
  assert.throws(() => validateAddress({ ...address, phone: 'abc' }));
  assert.throws(() => validateAddress({ ...address, street: '' }));
});
test('reviews require integer rating and bounded comment', () => {
  assert.deepEqual(validateReview({ rating: 5, comment: ' Nice ' }), {
    rating: 5,
    comment: 'Nice',
  });
  assert.throws(() => validateReview({ rating: 4.5, comment: 'Nice' }));
  assert.throws(() => validateReview({ rating: 5, comment: 'x'.repeat(1001) }));
});
test('products require identity, price, sizes and safe images', () => {
  assert.equal(validateProduct(products[0]).price, 100);
  assert.throws(() => validateProduct({ ...products[0], name: '' }));
  assert.throws(() => validateProduct({ ...products[0], image: ['javascript:alert(1)'] }));
  assert.throws(() => validateProduct({ ...products[0], image: ['//example.invalid/image'] }));
});
test('redirects remain local', () => {
  for (const path of [
    '//example.invalid',
    '/%2fexample.invalid',
    '/\\example.invalid',
    'https://example.invalid',
    'javascript:alert(1)',
  ])
    assert.equal(safeRedirect(path), '/');
  assert.equal(safeRedirect('/cart?from=login'), '/cart?from=login');
});
test('configuration defaults to demo and rejects incomplete AWS mode', () => {
  assert.equal(createConfig().mode, 'demo');
  assert.throws(() => createConfig({ VITE_APP_MODE: 'aws' }));
  assert.throws(() => createConfig({ VITE_APP_MODE: 'production' }));
});
test('AWS config rejects credential-bearing or non-HTTPS URLs', () => {
  const env = {
    VITE_APP_MODE: 'aws',
    VITE_COGNITO_USER_POOL_ID: 'example',
    VITE_COGNITO_CLIENT_ID: 'example',
    VITE_PRODUCTS_API_URL: 'https://api.example.invalid',
    VITE_REVIEWS_API_URL: 'https://api.example.invalid/reviews',
    VITE_ORDERS_API_URL: 'https://api.example.invalid/orders',
  };
  assert.equal(createConfig(env).mode, 'aws');
  assert.throws(() =>
    createConfig({ ...env, VITE_ORDERS_API_URL: 'http://api.example.invalid/orders' }),
  );
  assert.throws(() =>
    createConfig({
      ...env,
      VITE_ORDERS_API_URL: 'https://user:example@api.example.invalid/orders',
    }),
  );
});
test('missing or malformed identity is not a signed-in user', () => {
  assert.equal(sessionUser({}), null);
  assert.equal(sessionUser({ tokens: { idToken: { payload: {} } } }), null);
  assert.equal(
    sessionUser({ tokens: { idToken: { payload: { sub: 'example', 'cognito:groups': 'admin' } } } })
      .isAdmin,
    false,
  );
});
test('MFA challenge is not a completed sign-in', () => {
  assert.equal(
    signInStep({ isSignedIn: false, nextStep: { signInStep: 'CONFIRM_SIGN_IN_WITH_TOTP_CODE' } }),
    'CONFIRM_SIGN_IN_WITH_TOTP_CODE',
  );
  assert.equal(signInStep({ isSignedIn: true }), 'DONE');
  assert.equal(signInStep({}), 'UNKNOWN');
});
test('demo checkout makes no network request and returns no address', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error('Unexpected network request.');
  };
  try {
    await signOut();
    await assert.rejects(() =>
      placeOrder({ address, shop: { products, cartItems: { sample: { M: 1 } } } }),
    );
    enterDemo('customer');
    assert.ok(sessionUser(await fetchAuthSession()));
    await assert.rejects(() => authHeaders(true)); // Local identity cannot become an AWS Bearer token.
    const result = await placeOrder({
      address,
      shop: { products, cartItems: { sample: { M: 1 } } },
    });
    assert.equal(result.demo, true);
    assert.equal(result.totals.total, 150);
    assert.equal(result.address, undefined);
    await assert.rejects(() =>
      placeOrder({
        address,
        paymentMethod: 'stripe',
        shop: { products, cartItems: { sample: { M: 1 } } },
      }),
    );
    await signOut();
    assert.equal(sessionUser(await fetchAuthSession()), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
