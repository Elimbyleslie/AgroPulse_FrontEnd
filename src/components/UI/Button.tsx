import React, { MouseEvent, ReactNode } from "react";
import clsx from "clsx";
import LoadingButton from './loading';

interface ButtonProps {
  children: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = "button",
  onClick,
  className,
  disabled,
  loading = false,
}) => {
  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      className={clsx(
        "flex justify-center items-center px-4 py-2 text-sm font-semibold rounded-md",
        "transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <LoadingButton loading={loading}>
        {children}
      </LoadingButton>
    </button>
  );
};

export default Button;