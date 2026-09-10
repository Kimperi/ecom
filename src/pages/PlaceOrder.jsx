import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import CartTotal from '../components/CartTotal';
import { placeOrder } from '../lib/placeOrder';
import { isDemo } from '../config';

const fields = [
  ['firstName', 'First name'],
  ['lastName', 'Last name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['street', 'Street address'],
  ['city', 'City'],
  ['state', 'Region'],
  ['zip', 'Postal code'],
  ['country', 'Country'],
];
const emptyAddress = Object.fromEntries(fields.map(([key]) => [key, '']));
const sampleAddress = {
  firstName: 'Demo',
  lastName: 'Customer',
  email: 'customer@example.invalid',
  phone: '0000000000',
  street: '123 Example Street',
  city: 'Demo City',
  state: 'Demo Region',
  zip: '00000',
  country: 'Demo Country',
};

export default function PlaceOrder() {
  const shop = useContext(ShopContext);
  const navigate = useNavigate();
  const [address, setAddress] = useState(emptyAddress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const receipt = await placeOrder({ address, shop });
      shop.finishOrder();
      navigate('/orders', { replace: true, state: { receipt } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="max-w-6xl mx-auto px-5 py-12">
      <h1 className="text-3xl prata-regular mb-8">{isDemo ? 'Try the checkout' : 'Checkout'}</h1>
      {isDemo && (
        <div className="bg-slate-100 rounded-xl p-5 mb-8">
          <p>Use fictional details only. Nothing is sent or saved outside this page.</p>
          <button
            type="button"
            onClick={() => setAddress(sampleAddress)}
            className="underline mt-2 font-semibold"
          >
            Fill with sample details
          </button>
        </div>
      )}
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-12">
        <section>
          <h2 className="text-xl font-semibold mb-5">Delivery address</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {fields.map(([name, label]) => (
              <label
                key={name}
                className={name === 'street' || name === 'email' ? 'sm:col-span-2' : ''}
              >
                {label}
                <input
                  name={name}
                  type={name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'text'}
                  value={address[name]}
                  onChange={(e) => setAddress({ ...address, [name]: e.target.value })}
                  required
                  maxLength={200}
                  pattern={name === 'phone' ? '[0-9]{6,15}' : undefined}
                  className="block border rounded-lg p-3 w-full mt-2"
                />
              </label>
            ))}
          </div>
        </section>
        <section>
          <CartTotal />
          <h2 className="text-xl font-semibold mt-8 mb-4">Payment method</h2>
          <p className="border rounded-lg p-4">Cash on delivery{isDemo ? ' (simulation)' : ''}</p>
          <p className="text-sm text-slate-500 mt-3">Online card payments are not implemented.</p>
          {error && (
            <p role="alert" className="text-red-700 mt-5">
              {error}
            </p>
          )}
          <button
            disabled={loading || shop.getCartCount() === 0}
            className="bg-slate-900 text-white rounded-lg px-8 py-4 mt-8 disabled:opacity-40"
          >
            {loading ? 'Submitting…' : isDemo ? 'Complete demo checkout' : 'Submit order request'}
          </button>
        </section>
      </form>
    </main>
  );
}
