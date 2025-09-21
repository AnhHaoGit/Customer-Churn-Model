'use client'


import React from "react";
import { useRouter } from "next/navigation";
import CustomerForm from "@/components/CustomerForm";


const Main = () => {
  const router = useRouter();
  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/upload-csv", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      console.log("Upload successful:", data);
      localStorage.setItem("predictionResults", JSON.stringify(data));
      router.push("/result");
    } catch (err) {
      console.error("Error uploading CSV:", err);
    }
  };

  return (
    <main className="flex flex-col p-10 items-center gap-10">
      <p className="font-bold text-3xl">
        Upload a .csv file or single customer data
      </p>
      <div>
        <button className="flex items-center gap-2 bg-iris text-white rounded-full py-3 px-8 shadow-2xl font-bold justify-center hover:bg-violet transition-colors cursor-pointer text-sm">
          <input
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handleUpload}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5 sm:size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
          Upload your .CSV file
        </button>
      </div>
      <div>
        <CustomerForm />
      </div>
    </main>
  );
};

export default Main;
