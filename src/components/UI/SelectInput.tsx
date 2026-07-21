import { ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";

type Option = {
  value: string | number;
  label: string;
};

type SelectInputProps = {
  value: string | number | null;
  onChange: (value: string | number) => void;
  options: Option[];
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

const SelectInput = ({
  value,
  onChange,
  options,
  loading = false,
  disabled = false,
  placeholder = "Sélectionner",
}: SelectInputProps) => {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      {/* INPUT */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
        `}
      >
        <span className={`${!selectedOption ? "text-gray-400" : ""}`}>
          {selectedOption?.label || placeholder}
        </span>

        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* OPTIONS */}
      {open && !disabled && !loading && (
        <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border bg-white shadow">
          {options.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-400">Aucune option</li>
          )}

          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-green-50"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SelectInput;
