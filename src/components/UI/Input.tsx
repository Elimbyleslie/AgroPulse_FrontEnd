import React from "react";
import { useField } from "formik";

interface InputProps {
  label?: string;
  name: string;
  type?: string;
  placeholder?: string;
  containerClassName?: string;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
  required?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  maxLength?: number;
  pattern?: string;
  readOnly?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  containerClassName = "",
  className = "",
  disabled = false,
  required = false,
  ...props 
}) => {
  const [field, meta] = useField(props.name);

  // Déterminer si le champ a une erreur
  const hasError = meta.touched && meta.error;
  const isValid = meta.touched && !meta.error && field.value;

  // Gestion des couleurs dynamiques
  const inputColor = hasError
    ? "border-red-500 focus:ring-red-500 focus:border-red-500"   // ❌ Erreur
    : isValid
    ? "border-green-500 focus:ring-green-500 focus:border-green-500" // ✅ Valide
    : "border-gray-300 focus:ring-primary focus:border-primary";      // 🟦 Normal

  // État disabled
  const disabledStyles = disabled 
    ? "bg-gray-100 cursor-not-allowed opacity-60" 
    : "bg-white";

  return (
    <div className={`flex flex-col gap-1 w-full ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={props.name}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        {...field}
        {...props}
        id={props.name}
        disabled={disabled}
        aria-invalid={hasError ? "true" : "false"}
        aria-describedby={hasError ? `${props.name}-error` : undefined}
        className={`
          p-3 rounded-lg border-2 outline-none transition-all duration-200
          focus:ring-2 focus:ring-opacity-50
          ${inputColor}
          ${disabledStyles}
          ${className}
        `}
      />

      {hasError && (
        <span 
          id={`${props.name}-error`}
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
    </div>
  );
};

export default Input;