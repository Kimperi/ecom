import { Link, useLocation } from 'react-router-dom';
import { isDemo } from '../config';

export default function Orders() {
  const { state } = useLocation();
  const receipt = state?.receipt;
  return (
    <section className="max-w-2xl mx-auto px-6 py-16 min-h-[50vh]">
      <p className="text-sm uppercase tracking-widest text-slate-500">
        {isDemo ? 'Portfolio demonstration' : 'Checkout'}
      </p>
      <h1 className="text-3xl prata-regular mt-3 mb-6">
        {!receipt
          ? 'No checkout to display'
          : receipt.demo
            ? 'Demo checkout complete'
            : 'Order request submitted'}
      </h1>
      <p className="text-slate-600 leading-relaxed">
        {!receipt
          ? 'Complete the checkout journey to see its result here. This page is not an order-history service.'
          : receipt.demo
            ? 'You have completed the sample shopping journey. No real order was placed, no payment was collected and no email was sent.'
            : 'Your request was accepted by the configured service. This is not proof of payment or a delivery guarantee.'}
      </p>
      {receipt?.reference && (
        <p className="mt-5">
          Reference: <span className="font-mono">{receipt.reference}</span>
        </p>
      )}
      {receipt?.demo && <p className="mt-2">Sample total: {receipt.totals.total.toFixed(2)} MAD</p>}
      <Link
        to="/collection"
        className="inline-block mt-8 bg-slate-900 text-white px-6 py-3 rounded"
      >
        Continue shopping
      </Link>
    </section>
  );
}
