import React, { useState } from "react";
import { useField } from "formik";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface PasswordInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
  showStrengthMeter?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  name,
  label,
  placeholder = "Mot de passe",
  className = "",
  containerClassName = "",
  disabled = false,
  autoComplete = "current-password",
  required = false,
  showStrengthMeter = false,
}) => {
  const [field, meta] = useField(name);
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);

  // Déterminer si le champ a une erreur
  const hasError = meta.touched && meta.error;
  const isValid = meta.touched && !meta.error && field.value;

  // Gestion des couleurs dynamiques
  const inputColor = hasError
    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
    : isValid
    ? "border-green-500 focus:ring-green-500 focus:border-green-500"
    : "border-gray-300 focus:ring-primary focus:border-primary";

  // État disabled
  const disabledStyles = disabled 
    ? "bg-gray-100 cursor-not-allowed opacity-60" 
    : "bg-white";

  // Calcul de la force du mot de passe
  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    const strengthLabels = [
      { label: "Très faible", color: "bg-red-500" },
      { label: "Faible", color: "bg-orange-500" },
      { label: "Moyen", color: "bg-yellow-500" },
      { label: "Bon", color: "bg-blue-500" },
      { label: "Fort", color: "bg-green-500" },
    ];

    return {
      strength: Math.min(strength, 5),
      label: strengthLabels[strength - 1]?.label || "",
      color: strengthLabels[strength - 1]?.color || "",
    };
  };

  const passwordStrength = showStrengthMeter ? getPasswordStrength(field.value) : null;

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

      <div className="relative">
        <input
          {...field}
          id={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={hasError ? "true" : "false"}
          aria-describedby={hasError ? `${name}-error` : undefined}
          className={`
            w-full p-3 pr-12 rounded-lg border-2 outline-none transition-all duration-200
            focus:ring-2 focus:ring-opacity-50
            ${inputColor}
            ${disabledStyles}
            ${className}
          `}
        />

        <button
          type="button"
          onClick={togglePassword}
          disabled={disabled}
          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          className={`
            absolute right-3 top-1/2 -translate-y-1/2 
            text-gray-600 hover:text-gray-800 
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-primary rounded
            ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          `}
        >
          {showPassword ? (
            <FaEyeSlash className="w-5 h-5" />
          ) : (
            <FaEye className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Indicateur de force du mot de passe */}
      {showStrengthMeter && field.value && (
        <div className="mt-2 space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  level <= (passwordStrength?.strength || 0)
                    ? passwordStrength?.color
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          {passwordStrength && passwordStrength.label && (
            <p className="text-xs text-gray-600">
              Force du mot de passe: <span className="font-medium">{passwordStrength.label}</span>
            </p>
          )}
        </div>
      )}

      {/* Message d'erreur */}
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
    </div>
  );
};

export default PasswordInput;