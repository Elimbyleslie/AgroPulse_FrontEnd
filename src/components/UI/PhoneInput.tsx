import React from "react";
import { useField } from "formik";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface PhoneInputFieldProps {
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  containerClassName?: string;
  defaultCountry?: "CM" | "FR" | "US" | "CA" | "GB" | string;
}

const PhoneInputField: React.FC<PhoneInputFieldProps> = ({ 
  label, 
  name,
  placeholder = "Entrez votre numéro",
  disabled = false,
  required = false,
  containerClassName = "",
  defaultCountry = "CM"
}) => {
  const [field, meta, helpers] = useField<string | undefined>(name);

  const hasError = meta.touched && meta.error;
  const isValid = meta.touched && !meta.error && field.value;

  // Gestion des couleurs dynamiques
  const borderColor = hasError
    ? "border-red-500 focus-within:ring-red-500"
    : isValid
    ? "border-green-500 focus-within:ring-green-500"
    : "border-gray-300 focus-within:ring-primary";

  const disabledStyles = disabled 
    ? "bg-gray-100 cursor-not-allowed opacity-60" 
    : "bg-white";

  return (
    <div className={`flex flex-col gap-1 w-full ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={name}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`
          flex items-center rounded-lg px-3 py-2
          transition-all duration-200 w-full border-2
          focus-within:ring-2 focus-within:ring-opacity-50
          ${borderColor}
          ${disabledStyles}
        `}
      >
        <PhoneInput
          id={name}
          defaultCountry={defaultCountry as unknown as undefined}
          value={field.value}
          onChange={(value) => {
            helpers.setValue(value, true);
          }}
          onBlur={() => {
            helpers.setTouched(true, true);
          }}
          international
          countryCallingCodeEditable={false}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full phone-input-custom"
          aria-invalid={hasError ? "true" : "false"}
          aria-describedby={hasError ? `${name}-error` : undefined}
        />
      </div>

      {hasError && (
        <span 
          id={`${name}-error`}
          className="text-sm text-red-500 flex items-center gap-1"
          role="alert"
        >
          <svg 
            className="w-4 h-4" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          {meta.error}
        </span>
      )}

      <style>{`
        .phone-input-custom input {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          font-size: 0.875rem;
          background: transparent !important;
        }

        .phone-input-custom input:focus {
          outline: none !important;
          box-shadow: none !important;
        }

        .phone-input-custom input:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .phone-input-custom .PhoneInputCountry {
          margin-right: 0.5rem;
        }

        .phone-input-custom .PhoneInputCountrySelect {
          border: none;
          background: transparent;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
        }

        .phone-input-custom .PhoneInputCountrySelect:focus {
          outline: none;
        }

        .phone-input-custom .PhoneInputCountrySelectArrow {
          border-color: #6b7280;
          opacity: 0.7;
        }

        ${disabled ? `
          .phone-input-custom .PhoneInputCountrySelect,
          .phone-input-custom .PhoneInputCountryIcon {
            opacity: 0.5;
            cursor: not-allowed;
          }
        ` : ''}
      `}</style>
    </div>
  );
};

export default PhoneInputField;