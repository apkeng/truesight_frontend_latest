import React, { useState, forwardRef } from "react";
import clsx from "clsx";

const Textbox = forwardRef(
  (
    {
      type,
      placeholder,
      label,
      className,
      register,
      name,
      error,
      icon,
      readOnly,
    },
    ref
  ) => {
    const [inputType, setInputType] = useState(type);

    const togglePasswordVisibility = () => {
      if (!readOnly) {
        // Only allow toggle if the input is not read-only
        setInputType(inputType === "password" ? "text" : "password");
      }
    };

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label htmlFor={name} className="text-ink">
            {label}
          </label>
        )}

        <div className="relative">
          <input
            type={inputType}
            name={name}
            placeholder={placeholder}
            ref={ref}
            {...register}
            aria-invalid={error ? "true" : "false"}
            className={clsx(
              "bg-transparent px-3 py-2.5 2xl:py-3 border border-gray-300 placeholder-gray-400 text-ink outline-none text-base focus:ring-2 ring-blue-300 w-full",
              className,
              {
                "opacity-50 cursor-not-allowed": readOnly, // Style for read-only state
              }
            )}
            readOnly={readOnly} // Make input field read-only if the readOnly prop is true
          />
          {type === "password" && !readOnly && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-3 flex items-center text-ink-muted"
              style={{ fontSize: "10px" }}
            >
              {inputType === "password" ? "Show" : "Hide"}
            </button>
          )}
        </div>
        {error && (
          <span className="text-xs text-[#f64949fe] mt-0.5">{error}</span>
        )}
      </div>
    );
  }
);

export default Textbox;
