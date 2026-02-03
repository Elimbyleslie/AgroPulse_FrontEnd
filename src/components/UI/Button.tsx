import React, { MouseEvent, ReactNode } from "react";
import LoadingButton from './loading';

interface ButtonProps {
  children: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}



const Button: React.FC<ButtonProps> = ({
  children,
  type,
  onClick,
  className,
  disabled,
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={`flex px-4 py-2 text-sm text-white font-semibold dark:hover:bg-meta-4 rounded-md ${className}`}
    >
      <LoadingButton loading={false}>
        {children}
      </LoadingButton>
    </button>
  );
};

export default Button;