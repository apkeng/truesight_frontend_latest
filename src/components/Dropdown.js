import React, { useState } from "react";
import clsx from "clsx";

const Dropdown = ({
  label,
  register,
  options,
  className,
  error,
  placeholder,
}) => {
  // State to manage if the placeholder is currently selected
  const [isPlaceholderSelected, setIsPlaceholderSelected] = useState(true);

  const handleOnChange = (event) => {
    // When the user selects an option, update the placeholder state
    setIsPlaceholderSelected(event.target.value === "");
    // Call the register's onChange if it exists
    if (register && register.onChange) {
      register.onChange(event);
    }
  };

  return (
    <div className="w-full flex flex-col gap-1">
      {label && <label className="text-gray-700 ">{label}</label>}
      <div className="relative">
        <select
          className={clsx(
            "bg-transparent px-3 py-2.5 2xl:py-3 border border-gray-300 text-gray-900 text-base leading-tight focus:outline-none focus:ring-2 ring-blue-300 w-full shadow appearance-none rounded",
            {
              "cursor-not-allowed opacity-50": error,
              "text-gray-400": isPlaceholderSelected, // Apply gray color only when the placeholder is selected
              "text-gray-900": !isPlaceholderSelected, // Apply default color when an option is selected
            }
          )}
          {...register}
          onChange={handleOnChange}
          defaultValue="" // Ensures that the placeholder option is selected by default
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-xs text-red-500 italic mt-0.5">{error}</span>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
