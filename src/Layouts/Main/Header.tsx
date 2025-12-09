// src/components/Topbar.tsx
import React from 'react';
import logo from "../../assets/images/AgroPulse-1.png";
type Props = {
  onSearch?: (q: string) => void;
};
const Header = ({ onSearch }: Props) => {
  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-md bg-white">
         <img src={logo} alt="Logo" className=' h-10  max-md:h-6' />
        </div>

      </div>

        <div className=" flex  justify-between bg-gray-50  rounded-lg border w-96 p-1 max-md:max-w-96 ">
          <input
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder="Rechercher...."
            className=" px-3 focus:outline-none bg-gray-50 w- "
          />
          <button className=" bg-green-700 text-white px-3 py-1 rounded-lg">
            🔍
          </button>
        </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full bg-white shadow-md">🔔</button>
        <div className="w-10 h-10 rounded-full bg-gray-200" />
      </div>
    </header>
  );
}

export default  Header;
