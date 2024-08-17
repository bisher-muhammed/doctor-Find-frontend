import React from 'react';

const Card = ({ title, count, bgColor }) => {
  return (
    <div
      className={`relative flex flex-col mt-6 text-white shadow-md bg-clip-border rounded-xl w-96`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="p-6">
        <h5 className="block mb-2 font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
          {title}
        </h5>
        <p className="block font-sans text-4xl antialiased font-bold leading-relaxed text-inherit">
          {count}
        </p>
      </div>
      <div className="p-6 pt-0">
        
      </div>
    </div>
  );
};

export default Card;

