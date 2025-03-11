import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <>
      <nav className="p-4 text-white w-full z-50 font-smooch text-xl">
        <div className="flex justify-center items-center container mx-auto">

          {/* <Link to={'/contact'} className="mr-10">
            CONTACT
          </Link> */}

          {/* Center - Logo */}
          <Link to={'/home'}>
            <img className='h-14 bg-white  rounded-full p-1' src={logo} alt="Logo" />
          </Link>

          {/* <Link to={'/about'} className="ml-10">
            ABOUT US
          </Link> */}
        </div>
      </nav>
    </>
  );
};

export default Navbar;