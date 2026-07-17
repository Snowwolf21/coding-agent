import type { ButtonHTMLAttributes, ReactNode } from "react";

// Define the available button styles
type ButtonVariant = "primary" | "secondary" | "danger" | "outline" | "indigo" | "custom";
type ButtonSize = "sm" | "md" | "lg";

// Extend standard HTML button attributes so all native props (like onClick, disabled, type) work out-of-the-box
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  
  // Base classes for structure and transitions
  const baseStyles = "inline-flex items-center justify-center font-medium rounded transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Design variations
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-slate-700 hover:bg-slate-800 text-white focus:ring-slate-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    outline: "border border-slate-300 hover:bg-slate-100 text-slate-700 focus:ring-slate-500",
    indigo: "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 focus:ring-offset-slate-900",
    custom: "",
  };

  // Size variations
  const sizes: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs gap-1",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-current mr-1" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}

      {/* Optional Icon (Hidden if loading) */}
      {!isLoading && icon && <span className="flex items-center">{icon}</span>}

      {/* Button Text */}
      <span className="flex items-center gap-1.5">{children}</span>
    </button>
  );
}
