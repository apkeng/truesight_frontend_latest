import clsx from "clsx";
import React from "react";

const Button = ({ icon, className, label, type, onClick = () => {}, disabled, ...props }) => {
  return (
    <button
      type={type || "button"}
      className={clsx("px-3 py-2 outline-none", className)}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <span>{label}</span>
      {icon && icon}
    </button>
  );
};

export default Button;
