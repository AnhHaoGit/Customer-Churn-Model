"use client";

import React from "react";
import Navbar from "@/components/NavBar";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import storeData from "@/lib/local_storage_handlers/storeData";
import Link from "next/link";

const HistoryPage = () => {
  const { data: session } = useSession();
  const [fetchedData, setFetchedData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  async function fetchData(userId) {
    const res = await fetch("/api/fetch_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch history");
    }

    return await res.json();
  }

  useEffect(() => {
    if (session?.user?.id) {
      setIsFetching(true);
      fetchData(session.user.id)
        .then((docs) => {
          setFetchedData(docs);
          storeData(docs);
        })
        .catch(console.error)
        .finally(() => setIsFetching(false));
    }
  }, [session?.user?.id]);

  return (
    <>
      <Navbar />
      <main className="h-screen bg-gray-50 p-10 mt-20">
        <h1 className="text-3xl font-bold mb-6 text-center">Upload History</h1>

        {isFetching ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : fetchedData.length === 0 ? (
          <p className="text-center text-gray-500">No uploads yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fetchedData.map((item) => (
              <Link
                key={item._id}
                className="rounded-xl shadow-md p-4 bg-white border border-gray-200 hover:shadow-lg transition-shadow"
                href={`/result/${item._id}`}
              >
                <p className="text-lg font-semibold text-gray-800">
                  Upload ID:
                  <span className="ml-1 text-gray-600 break-all">
                    {item._id}
                  </span>
                </p>
                <p className="mt-2 text-gray-700">
                  Number of customers:{" "}
                  <span className="font-medium">
                    {Array.isArray(item.data) ? item.data.length : 0}
                  </span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default HistoryPage;
