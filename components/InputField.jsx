"use client";
import { Input } from "@/components/ui/input";

const InputField = ({ label, type, step, register, min, placeholder }) => (
  <div>
    <label className="block mb-2 font-medium">{label}</label>
    <Input
      type={type}
      step={step}
      min={min}
      placeholder={placeholder}
      {...register}
      className="bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-indigo-400"
    />
  </div>
);

export default InputField;
