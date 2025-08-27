import React, { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";

const CartTotal = () => {
  const { cartItems, products, deliveryFee, currency } =
    useContext(ShopContext);

  const { subtotal, itemsCount } = useMemo(() => {
    let subtotalAcc = 0;
    let count = 0;

    // cartItems shape: { [id]: { [size]: qty } }
    for (const id in cartItems) {
      const sizes = cartItems[id] || {};
      const product = products.find((p) => String(p.id) === String(id));
      if (!product) continue; // product may have been deleted

      const price = Number(product.price) || 0;

      for (const size in sizes) {
        const qty = Number(sizes[size]) || 0;
        if (qty <= 0) continue;
        count += qty;
        subtotalAcc += price * qty;
      }
    }
    return { subtotal: subtotalAcc, itemsCount: count };
  }, [cartItems, products]);

  const shipping = itemsCount > 0 ? Number(deliveryFee || 0) : 0;
  const total = subtotal + shipping;

  const fmt = (n) => `${currency} ${Number(n || 0).toFixed(2)}`; // e.g. "MAD 200.00"

  return (
    <div className="w-full border p-5">
      <h3 className="text-xl font-semibold mb-4">Cart Totals</h3>
      <div className="flex items-center justify-between py-2 border-b">
        <p>Subtotal</p>
        <p>{fmt(subtotal)}</p>
      </div>
      <div className="flex items-center justify-between py-2 border-b">
        <p>Shipping Fee</p>
        <p>{fmt(shipping)}</p>
      </div>
      <div className="flex items-center justify-between py-3 font-semibold">
        <p>Total</p>
        <p>{fmt(total)}</p>
      </div>
    </div>
  );
};

export default CartTotal;
