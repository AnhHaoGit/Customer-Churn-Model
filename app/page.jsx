"use client";
import NavBar from "@/components/NavBar";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import storeData from "@/lib/local_storage_handlers/storeData";

export default function Home() {
  const { data: session } = useSession();
  const [fetchedData, setFetchedData] = useState([]);

  async function fetchData(userId) {
    const res = await fetch("/api/fetch_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch history");
    }

    const history = await res.json();
    return history;
  }

  // Dùng trong useEffect
  useEffect(() => {
    if (session?.user?.id) {
      fetchData(session.user.id)
        .then((docs) => {
          setFetchedData(docs);
          storeData(docs);
        })
        .catch(console.error);
    }
  }, [session?.user?.id]);

  console.log(fetchedData);

  return (
    <>
      <NavBar />
      <main className="flex flex-col items-center justify-center h-screen gap-10">
        <div className="flex flex-col gap-2 items-center">
          <p className="text-4xl font-bold mt-10">
            Predicting Customer Churn Model AI
          </p>
          <p className="gray text-sm">
            Trained by using dataset from a telecommunication company
          </p>
        </div>
        {session ? (
          <Link
            href="/main"
            className="bg-black px-5 py-2 text-white rounded-3xl hover:bg-gray-800 transition-colors cursor-pointer text-center"
          >
            Go to App
          </Link>
        ) : (
          <Link
            href="/login"
            className="bg-black px-5 py-2 text-white rounded-3xl hover:bg-gray-800 transition-colors cursor-pointer text-center"
          >
            Login
          </Link>
        )}
      </main>
    </>
  );
}
