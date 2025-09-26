"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const Page = () => {
  const [results, setResults] = useState(null);
  const { uploadId } = useParams();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("data") || null);
    const upload = data.find(
      (upload) => String(upload._id) === String(uploadId)
    );
    if (upload) setResults(upload.data);
  }, []);

  console.log(results)

  return (
    <main className="flex flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-2">
        <p className="text-4xl font-bold mt-20">Prediction Results</p>
        <p>The model’s accuracy is about 80%.</p>
      </div>

      <div>
        {/* ==== Header ==== */}
        <div className="grid grid-cols-[1fr_2.5fr_1fr_1fr_1fr_1fr] gap-4 font-bold border-b-2 pb-2 w-[1350px]">
          <p>User Name</p>
          <p>Email</p>
          <p>Customer ID</p>
          <p>Churn</p>
          <p>Churn Probability</p>
          <p>Action</p>
        </div>

        {/* ==== Rows ==== */}
        <div className="max-h-[600px] overflow-y-auto w-[1350px]">
          {results ? (
            results.map((item, index) => (
              <Link
                key={index}
                className="grid grid-cols-[1fr_2.5fr_1fr_1fr_1fr_1fr] gap-4 border-b py-4 items-center hover:bg-gray-200"
                href={`/profile/${uploadId}/${item.id}`}
              >
                <p>{item.userName}</p>
                <p>{item.email}</p>
                <p>{item.id}</p>
                {item.churn ? (
                  <p className="text-indigo-600 font-semibold">Yes</p>
                ) : (
                  <p>No</p>
                )}
                {item.churn ? (
                  <p className="text-indigo-600 font-semibold">
                    {(item.churnProbability * 100).toFixed(2)}%
                  </p>
                ) : (
                  <p>{(item.churnProbability * 100).toFixed(2)}%</p>
                )}

                {/* Nút gửi email */}
                <button className="flex items-center justify-center gap-1 bg-indigo-700 text-white px-3 py-2 text-sm rounded hover:bg-indigo-800 transition">
                  Send email
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                </button>
              </Link>
            ))
          ) : (
            <p>No results available. Please upload a CSV file first.</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default Page;
