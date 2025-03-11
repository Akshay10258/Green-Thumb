import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({ title, description, image , link}) => {
  return (
   <Link to={link} className='no-underline'>
      <div  className="bg-black/30 backdrop-blur-md p-8 rounded-3xl shadow-lg text-white flex flex-col justify-center items-center text-center w-80 border-white border-2">
      <img src={image} alt={title} className="w-24 h-24 object-cover rounded-full mb-4" />
      <h2 className="text-2xl font-bold font-smooch mb-2  text-spotify-green">{title}</h2>
      <p className="text-white text-sm font-mono">{description}</p>
    </div>
    </Link>
  );
};

export default Card;
