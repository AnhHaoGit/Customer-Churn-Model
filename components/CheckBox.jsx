"use client";
import { Controller } from "react-hook-form";

const CheckBox = ({ label, name, control }) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { value, onChange } }) => (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value === 1}
          onChange={(e) => onChange(e.target.checked ? 1 : 0)}
        />
        <label className="block mb-2 font-medium">{label}</label>
      </div>
    )}
  />
);

export default CheckBox;
