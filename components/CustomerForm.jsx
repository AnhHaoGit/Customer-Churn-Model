"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import validateUserInfo from "@/lib/validateUserInfo";
import InputField from "./InputField";
import SelectBox from "./SelectBox";
import CheckBox from "./CheckBox";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "react-toastify";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import updateData from "@/lib/local_storage_handlers/updateData";

const serviceLabels = {
  seniorCitizen: "Senior Citizen",
  partner: "Partner",
  dependents: "Dependents",
  phoneService: "Phone Service",
  multipleLines: "Multiple Lines",
  onlineSecurity: "Online Security",
  onlineBackup: "Online Backup",
  deviceProtection: "Device Protection",
  techSupport: "Tech Support",
  streamingTv: "Streaming TV",
  streamingMovies: "Streaming Movies",
  paperlessBilling: "Paperless Billing",
};

const defaultValues = {
  userName: "",
  email: "",
  tenure: 0,
  monthlyCharges: 19.0,
  totalCharges: 19.0,
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
  const router = useRouter();
  const { data: session, status } = useSession();
  const { register, handleSubmit, setValue, control } = useForm({
    defaultValues,
  });

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (status === "authenticated" && !session?.user?.id)
    ) {
      toast.error("Log in to use the app!");
      router.push("/login");
    }
  }, [status, session, router]);

  const onSubmit = async (data) => {
    if (status !== "authenticated" || !session?.user?.id) {
      toast.error("Log in to use the model!");
      router.push("/login");
      return;
    }
    if (!validateUserInfo(data.userName, data.email)) {
      return;
    }

    const userId = session.user.id;

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data, userId }),
      });

      const responseData = await res.json();
      updateData({
        _id: responseData.uploadId,
        userId: responseData.userId,
        data: [
          {
            ...data,
            id: responseData.id,
            churn: responseData.churn,
            churnProbability: responseData.churnProbability,
          },
        ],
      });
      router.push(`/result/${responseData.uploadId}`);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Card className="mx-auto p-8 bg-white shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold text-black">
          Customer Information
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
        <CardContent className="flex justify-between gap-10">
          {/* Basic Inputs */}
          <section>
            <h2 className="text-lg font-semibold mb-4 iris">Basic Inputs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ✨ Thêm hai trường mới */}
              <InputField
                label="Name"
                type="text"
                register={register("userName")}
                placeholder="Enter your name"
              />
              <InputField
                label="Email"
                type="email"
                register={register("email")}
                placeholder="Enter your email"
              />

              <InputField
                label="Tenure (months)"
                type="number"
                register={register("tenure", { valueAsNumber: true })}
                min="0"
              />
              <InputField
                label="Monthly Charges"
                type="number"
                step="0.01"
                register={register("monthlyCharges", { valueAsNumber: true })}
                min="19.0"
              />
              <InputField
                label="Total Charges"
                type="number"
                step="0.01"
                register={register("totalCharges", { valueAsNumber: true })}
                min="19.0"
              />
            </div>
          </section>

          {/* Options */}
          <section>
            <h2 className="text-lg font-semibold mb-4 iris">Options</h2>
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
            <h2 className="text-lg font-semibold mb-4 iris">Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(serviceLabels).map((name) => (
                <CheckBox
                  key={name}
                  label={serviceLabels[name]} // nhãn hiển thị đẹp
                  name={name} // giữ key camelCase để submit
                  control={control}
                />
              ))}
            </div>
          </section>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            type="submit"
            className="px-15 py-3 rounded-3xl bg-iris hover:bg-violet text-sm text-white"
          >
            Submit
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
