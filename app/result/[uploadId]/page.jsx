"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import Navbar from "@/components/NavBar";

const Page = () => {
  const [results, setResults] = useState(null);
  const [original, setOriginal] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");
  const { uploadId } = useParams();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("data") || "null");
    if (!data) return;
    const upload = data.find((u) => String(u._id) === String(uploadId));
    if (upload) {
      setOriginal(upload.data);
      setResults(upload.data);
    }
  }, [uploadId]);

  const toggleSort = () => {
    if (!results || !original) return;

    let nextOrder;
    if (sortOrder === "default") nextOrder = "asc";
    else if (sortOrder === "asc") nextOrder = "desc";
    else nextOrder = "default";

    let sorted;
    if (nextOrder === "asc") {
      sorted = [...results].sort(
        (a, b) => a.churnProbability - b.churnProbability
      );
    } else if (nextOrder === "desc") {
      sorted = [...results].sort(
        (a, b) => b.churnProbability - a.churnProbability
      );
    } else {
      sorted = [...original];
    }

    setSortOrder(nextOrder);
    setResults(sorted);
  };

  const sendEmail = async (email, userName, churnProbability, uploadId) => {
    try {
      const res = await fetch("/api/send_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userName, churnProbability, uploadId }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(`Email sent to ${email}`);

        // ✅ Cập nhật lại state để phản ánh sentEmail: true
        setResults((prev) =>
          prev.map((item) =>
            item.email === email ? { ...item, sentEmail: true } : item
          )
        );

        // ✅ Đồng thời cập nhật lại localStorage (để không mất khi refresh)
        const storedData = JSON.parse(localStorage.getItem("data") || "[]");
        const updatedData = storedData.map((upload) => {
          if (String(upload._id) === String(uploadId)) {
            return {
              ...upload,
              data: upload.data.map((i) =>
                i.email === email ? { ...i, sentEmail: true } : i
              ),
            };
          }
          return upload;
        });
        localStorage.setItem("data", JSON.stringify(updatedData));
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Error sending email:", err);
      toast.error("Failed to send email");
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center gap-10 mt-10">
        <div className="flex flex-col items-center gap-2">
          <p className="text-4xl font-bold mt-20">Prediction Results</p>
          <p>The model’s accuracy is about 80%.</p>
        </div>

        <div className="w-[1350px]">
          <div className="flex justify-between items-center mb-2">
            <div className="grid grid-cols-[1fr_2.5fr_1fr_1fr_1.5fr_1fr] gap-4 font-bold border-b-2 pb-2 flex-1">
              <p>User Name</p>
              <p>Email</p>
              <p>Customer ID</p>
              <p>Churn</p>
              <p className="flex">
                Churn Probability
                <button
                  onClick={toggleSort}
                  className="ml-2 text-sm bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                >
                  {sortOrder === "default"
                    ? "⭯"
                    : sortOrder === "asc"
                      ? "↑"
                      : "↓"}
                </button>
              </p>
              <p>Action</p>
            </div>
          </div>

          <div className="max-h-[550px] overflow-y-auto">
            {results && results.length > 0 ? (
              results.map((item, index) => (
                <Link
                  key={index}
                  href={`/profile/${uploadId}/${item.id}`}
                  className="grid grid-cols-[1fr_2.5fr_1fr_1fr_1.5fr_1fr] gap-4 border-b py-4 items-center hover:bg-gray-200 cursor-pointer"
                >
                  <p>{item.userName}</p>
                  <p>{item.email}</p>
                  <p>{item.id}</p>
                  {item.churn ? (
                    <p className="text-indigo-600 font-semibold">Yes</p>
                  ) : (
                    <p>No</p>
                  )}
                  <p
                    className={
                      item.churn
                        ? "text-indigo-600 font-semibold"
                        : "text-gray-800"
                    }
                  >
                    {(item.churnProbability * 100).toFixed(2)}%
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.sentEmail) return; // đã gửi thì không gửi lại
                      sendEmail(
                        item.email,
                        item.userName,
                        item.churnProbability,
                        uploadId
                      );
                    }}
                    disabled={item.sentEmail}
                    className={`flex items-center justify-center gap-1 px-3 py-2 text-sm rounded transition
                      ${
                        item.sentEmail
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-indigo-700 text-white hover:bg-indigo-800"
                      }`}
                  >
                    {item.sentEmail ? "Email Sent" : "Send Email"}
                  </button>
                </Link>
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
