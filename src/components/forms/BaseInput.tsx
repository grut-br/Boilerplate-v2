import React, { forwardRef, useId } from "react";

export interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const defaultId = useId();
    const inputId = id || defaultId;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-zinc-300 select-none cursor-pointer"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:ring-1 ${
            error
              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50"
              : "border-zinc-800 focus:border-violet-500/50 focus:ring-violet-500/50"
          } ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {error && (
          <span
            id={errorId}
            className="text-xs text-red-500 font-medium"
            role="alert"
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

BaseInput.displayName = "BaseInput";
