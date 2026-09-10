import React from 'react';
import { assets } from '../assets/assets';

const OurPolicy = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-500">
      <div>
        <img src={assets.exchange_icon} className="w-12 m-auto mb-5" alt="" />
        <p className="font-semibold">Explore the shopping journey</p>
        <p className="text-gray-400">Catalog, sizes, cart and sample reviews</p>
      </div>

      <div>
        <img src={assets.quality_icon} className="w-12 m-auto mb-5" alt="" />
        <p className="font-semibold">A transparent portfolio demo</p>
        <p className="text-gray-400">No real purchases, payments or deliveries</p>
      </div>

      <div>
        <img src={assets.support_img} className="w-12 m-auto mb-5" alt="" />
        <p className="font-semibold">Understand the architecture</p>
        <p className="text-gray-400">Source code and engineering notes on GitHub</p>
      </div>
    </div>
  );
};

export default OurPolicy;
