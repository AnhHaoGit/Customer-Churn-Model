"use client";

import Navbar from "@/components/NavBar";
import Image from "next/image";
import img from "@/assets/avatar.webp";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import ReactMarkdown from "react-markdown";


function camelToTitle(str) {
  if (!str) return "";
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const ProfilePage = () => {
  const [result, setResult] = useState(null);
  const { uploadId, id } = useParams();
  const [selectedServices, setSelectedServices] = useState([]);

  const [analysis, setAnalysis] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("data");
    if (!raw) return;

    const arr = JSON.parse(raw);
    const upload = arr.find((item) => String(item._id) === String(uploadId));
    const found = upload?.data.find((item) => String(item.id) === String(id));

    setResult(found || null);

    if (found) {
      const services = Object.keys(found).filter(
        (key) => found[key] === 1 && key !== "tenure" && key !== "id"
      );
      setSelectedServices(services);
    }
  }, [uploadId, id]);

  const handleAnalyze = async () => {
    if (!result) return;
    setLoadingAnalysis(true);
    setAnalysis("");
    try {
      const res = await fetch("/api/analyze_churn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      } else {
        setAnalysis("Không nhận được kết quả phân tích.");
      }
    } catch (err) {
      console.error(err);
      setAnalysis("Có lỗi xảy ra khi phân tích.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  console.log(analysis)

  return (
    <>
      <Navbar />
      <main className="max-h-screen from-indigo-50 via-white to-purple-50 flex flex-col items-center py-12 px-4 pt-50">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-12 drop-shadow-sm">
          Customer Profile
        </h1>

        <div className="w-full max-w-6xl bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl border border-gray-100 p-8 md:p-12 flex flex-col gap-10">
          <div className="flex">
            <div className="flex flex-col items-center md:items-start md:w-1/3">
              <div className="relative">
                <Image
                  src={img}
                  alt="avatar"
                  className="w-48 h-48 rounded-full object-cover border-4 border-indigo-200 shadow-md"
                />
                <div className="absolute bottom-2 right-2 bg-iris text-white px-3 py-1 text-sm rounded-full shadow">
                  {result?.churn ? "At Risk" : "Active"}
                </div>
              </div>
              {result && (
                <p className="mt-5 text-center md:text-left text-lg text-gray-600">
                  ID: <span className="font-medium">{result.id}</span>
                </p>
              )}
            </div>

            {result ? (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <InfoItem label="Name" value={result.userName} />
                  <InfoItem label="Email" value={result.email} />
                  <InfoItem label="Gender" value={result.gender} />
                  <InfoItem label="Tenure" value={`${result.tenure} months`} />
                  <InfoItem
                    label="Monthly Charges"
                    value={`$${result.monthlyCharges}`}
                  />
                  <InfoItem
                    label="Total Charges"
                    value={`$${result.totalCharges}`}
                  />
                </div>

                <div className="space-y-3">
                  <InfoItem
                    label="Contract"
                    value={camelToTitle(result.contract)}
                  />
                  <InfoItem
                    label="Internet Service"
                    value={camelToTitle(result.internetService)}
                  />
                  <InfoItem
                    label="Payment Method"
                    value={camelToTitle(result.paymentMethod)}
                  />

                  <h2 className="text-xl font-semibold mt-6 text-gray-800">
                    Services
                  </h2>
                  {selectedServices.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedServices.map((ser, idx) => (
                        <span
                          key={idx}
                          className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full font-medium shadow-sm"
                        >
                          {camelToTitle(ser)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 mt-2">No additional services</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500 text-lg animate-pulse">
                  Loading...
                </p>
              </div>
            )}
          </div>
          {result && (
            <button
              onClick={handleAnalyze}
              className="mt-6 px-6 py-2 bg-iris hover:bg-violet text-white rounded-full shadow transition disabled:opacity-60 flex items-center justify-center"
              disabled={loadingAnalysis}
            >
              {loadingAnalysis ? (
                <div className="flex gap-2">
                  <p>Analyzing</p>
                  <Spinner key="ellipsis" variant="ellipsis" />
                </div>
              ) : (
                <p>Analyze Churn Reasons</p>
              )}
            </button>
          )}
          {analysis && (
            <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100 shadow-inner">
              <h3 className="font-semibold text-indigo-800 mb-2">
                Analysis Result
              </h3>
              <FormattedAnalysis text={analysis} />
            </div>
          )}
        </div>
      </main>
    </>
  );
};

function InfoItem({ label, value }) {
  return (
    <p className="text-gray-700">
      <span className="font-semibold text-gray-900">{label}:</span>{" "}
      <span>{value}</span>
    </p>
  );
}

function FormattedAnalysis({ text }) {
  if (!text) return null;

  // 1️⃣ Tách thành các dòng để xử lý từng dòng markdown
  const lines = text.split("\n");

  return (
    <div className="text-gray-700 leading-relaxed space-y-2">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        // 2️⃣ Headings
        if (trimmed.startsWith("###")) {
          return (
            <h3 key={index} className="text-lg font-bold text-indigo-800 mt-4">
              {trimmed.replace(/^###\s*/, "")}
            </h3>
          );
        }

        // 3️⃣ Bullet list
        if (trimmed.startsWith("- ")) {
          return (
            <li key={index} className="ml-6 list-disc">
              {formatBold(trimmed.replace(/^- /, ""))}
            </li>
          );
        }

        // 4️⃣ Numbered list
        if (/^\d+\./.test(trimmed)) {
          return (
            <li key={index} className="ml-6 list-decimal">
              {formatBold(trimmed.replace(/^\d+\.\s*/, ""))}
            </li>
          );
        }

        // 5️⃣ Đoạn văn thông thường
        if (trimmed === "") {
          return <div key={index} className="h-3" />; // khoảng cách
        }

        return (
          <p key={index} className="text-gray-700">
            {formatBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Hàm con xử lý **bold**
function formatBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}


export default ProfilePage;
