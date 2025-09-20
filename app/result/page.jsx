"use client";

import { useEffect, useState } from "react";

const Page = () => {
  const [results, setResults] = useState(null);

  useEffect(() => {
    // Fetch and display prediction results when the component mounts
    const results = JSON.parse(localStorage.getItem("predictionResults"));
    if (results) {
      setResults(results);
    }
  }, []);

  console.log("Results:", results);
  return (
    <>
      <main className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-2">
          <p className="text-4xl font-bold mt-20">Prediction Results</p>
          <p>The model’s accuracy is about 80%.</p>
        </div>
        <div>
          <div className="grid grid-cols-3 gap-4 font-bold border-b-2 pb-2">
            <p>Customer ID</p>
            <p>Churn</p>
            <p>Churn Probability</p>
          </div>
          <div className="max-h-[600px] overflow-y-auto w-[600px]">
            {results ? (
              results.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4 border-b py-2"
                >
                  <p>{item.id}</p>
                  {item.churn ? <p className="text-indigo-600 font-semibold">Yes</p> : <p>No</p>}
                  {item.churn ? (
                    <p className="text-indigo-600 font-semibold">{(item.churn_probability * 100).toFixed(2)}%</p>
                  ) : (
                    <p>{(item.churn_probability * 100).toFixed(2)}%</p>
                  )}
                </div>
              ))
            ) : (
              <p>No results available. Please upload a CSV file first.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Page;
