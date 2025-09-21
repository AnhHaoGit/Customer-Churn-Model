"use client";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const SelectBox = ({ label, defaultValue, setValue, options }) => (
  <div>
    <label className="block mb-2 font-medium">{label}</label>
    <Select
      defaultValue={defaultValue.value}
      onValueChange={(v) => setValue(v)}
    >
      <SelectTrigger className="bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-indigo-400">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-gray-50">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default SelectBox;
