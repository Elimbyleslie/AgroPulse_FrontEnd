import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[] ;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options?.find((opt) => opt.value === value);

  return (
    <div className="relative inline-block w-full md:w-48" ref={dropdownRef}>
      {/* Bouton Principal */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 
          ${isOpen ? "ring-2 ring-green-500 border-transparent" : "hover:border-green-400 shadow-sm"}`}
      >
        <span className={value === "all" ? "text-gray-400" : "text-darkText"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {/* Menu Déroulant */}
      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in duration-150">
          {options?.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs transition-colors
                ${value === option.value 
                  ? "bg-green-50 text-vert font-bold" 
                  : "text-text hover:bg-gray-50"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;