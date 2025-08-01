import React from "react";    
import { assets } from '../assets/assets'
import { NavLink } from "react-router-dom";


const Navbar = () => {
    return (
        <div className="flex justify-between items-center py-4 font-medium">
        <img src={assets.logo} className="w-36" alt="logo" />
        <ul className="hidden md:flex gap-5 text-sm text-gray-700">
           <NavLink className="hover:text-black transition-colors duration-300">
            <p>Home</p>
            </NavLink>
        </ul>
</div>
    )
}

export default Navbar