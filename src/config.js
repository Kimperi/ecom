// VITE_* values are public build-time configuration, never secrets.
export function createConfig(env = {}) {
  const mode = env.VITE_APP_MODE || 'demo';
  if (!['demo', 'aws'].includes(mode)) throw new Error('VITE_APP_MODE must be demo or aws.');
  const config = {
    mode,
    userPoolId: env.VITE_COGNITO_USER_POOL_ID || '',
    userPoolClientId: env.VITE_COGNITO_CLIENT_ID || '',
    productsUrl: env.VITE_PRODUCTS_API_URL || '',
    reviewsUrl: env.VITE_REVIEWS_API_URL || '',
    ordersUrl: env.VITE_ORDERS_API_URL || '',
  };
  if (mode === 'aws') {
    if (Object.values(config).some((value) => !value))
      throw new Error('AWS mode requires all values described in .env.example.');
    for (const field of ['productsUrl', 'reviewsUrl', 'ordersUrl']) {
      const url = new URL(config[field]);
      if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash)
        throw new Error('AWS API URLs must use HTTPS without credentials, queries or fragments.');
      config[field] = config[field].replace(/\/+$/, '');
    }
  }
  return Object.freeze(config);
}
export const config = createConfig(import.meta.env);
export const isDemo = config.mode === 'demo';
