import React from "react";
import { FcGoogle } from "react-icons/fc";

interface GoogleLoginButtonProps {
  onClick: () => void;
  text?: string;
  disabled?: boolean;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onClick,
  text = "Se connecter avec Google",
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="
        w-full flex items-center justify-center gap-3
        border border-gray-300 rounded-lg py-3 px-4
        bg-white text-gray-800 font-medium
        hover:bg-gray-50 transition
        disabled:opacity-60 disabled:cursor-not-allowed
      "
    >
      <FcGoogle size={22} />
      <span>{text}</span>
    </button>
  );
};

export default GoogleLoginButton;
