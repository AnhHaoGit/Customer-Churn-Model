"use client";
import NavBar from "@/components/NavBar";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
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
        <Link
          href="/main"
          className="bg-black px-5 py-2 text-white rounded-3xl hover:bg-gray-800 transition-colors cursor-pointer text-center"
        >
          Go to App
        </Link>
      </main>
    </>
  );
}
