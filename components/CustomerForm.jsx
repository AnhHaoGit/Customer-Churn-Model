"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const defaultValues = {
  tenure: 0,
  monthlyCharges: 0,
  totalCharges: 0,
  gender: "female",
  internetService: "dsl",
  contract: "monthToMonth",
  paymentMethod: "bankTransferAutomatic",
  seniorCitizen: 0,
  partner: 0,
  dependents: 0,
  phoneService: 0,
  multipleLines: 0,
  onlineSecurity: 0,
  onlineBackup: 0,
  deviceProtection: 0,
  techSupport: 0,
  streamingTv: 0,
  streamingMovies: 0,
  paperlessBilling: 0,
};

export default function CustomerForm() {
  const { register, handleSubmit, setValue, control } = useForm({
    defaultValues,
  });

  const onSubmit = async (data) => {
    console.log("Form data:", data);
    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });

      const responseData = await res.json();
      console.log("Response:", responseData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto p-8 bg-white shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold text-indigo-700">
          Customer Information
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <CardContent className="space-y-15">
          {/* Basic Inputs */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-indigo-700">
              Basic Inputs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Tenure (months)"
                type="number"
                register={register("tenure", { valueAsNumber: true })}
              />
              <InputField
                label="Monthly Charges"
                type="number"
                step="0.01"
                register={register("monthlyCharges", { valueAsNumber: true })}
              />
              <InputField
                label="Total Charges"
                type="number"
                step="0.01"
                register={register("totalCharges", { valueAsNumber: true })}
              />
            </div>
          </section>

          {/* Options */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-indigo-700">
              Options
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectBox
                label="Gender"
                defaultValue={{ label: "Female", value: "female" }}
                setValue={(v) => setValue("gender", v)}
                options={[
                  { label: "Female", value: "female" },
                  { label: "Male", value: "male" },
                ]}
              />

              <SelectBox
                label="Internet Service"
                defaultValue={{ label: "DSL", value: "dsl" }}
                setValue={(v) => setValue("internetService", v)}
                options={[
                  { label: "DSL", value: "dsl" },
                  { label: "Fiber optic", value: "fiberOptic" },
                  { label: "No", value: "no" },
                ]}
              />

              <SelectBox
                label="Contract"
                defaultValue={{
                  label: "Month-to-month",
                  value: "monthToMonth",
                }}
                setValue={(v) => setValue("contract", v)}
                options={[
                  { label: "Month-to-month", value: "monthToMonth" },
                  { label: "One year", value: "oneYear" },
                  { label: "Two year", value: "twoYear" },
                ]}
              />

              <SelectBox
                label="Payment Method"
                defaultValue={{
                  label: "Bank transfer (automatic)",
                  value: "bankTransferAutomatic",
                }}
                setValue={(v) => setValue("paymentMethod", v)}
                options={[
                  {
                    label: "Bank transfer (automatic)",
                    value: "bankTransferAutomatic",
                  },
                  {
                    label: "Credit card (automatic)",
                    value: "creditCardAutomatic",
                  },
                  { label: "Electronic check", value: "electronicCheck" },
                  { label: "Mailed check", value: "mailedCheck" },
                ]}
              />
            </div>
          </section>

          {/* Services */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-indigo-700">
              Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "seniorCitizen",
                "partner",
                "dependents",
                "phoneService",
                "multipleLines",
                "onlineSecurity",
                "onlineBackup",
                "deviceProtection",
                "techSupport",
                "streamingTv",
                "streamingMovies",
                "paperlessBilling",
              ].map((name) => (
                <CheckBox
                  key={name}
                  label={name}
                  name={name}
                  control={control}
                />
              ))}
            </div>
          </section>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            type="submit"
            className="px-15 py-3 rounded-3xl bg-indigo-700 hover:bg-indigo-600 text-lg text-white"
          >
            Submit
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// Input component
const InputField = ({ label, type, step, register }) => (
  <div>
    <label className="block mb-2 font-medium">{label}</label>
    <Input
      type={type}
      step={step}
      min={0}
      {...register}
      className="bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-indigo-400"
    />
  </div>
);

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
