"use client";

import Navbar from "@/components/NavBar";
import Image from "next/image";
import img from "@/assets/avatar.webp";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    const raw = localStorage.getItem("data");
    if (!raw) return;

    const arr = JSON.parse(raw);
    const upload = arr.find((item) => String(item._id) === String(uploadId));

    const found = upload.data.find((item) => String(item.id) === String(id));

    setResult(found || null);

    if (found) {
      const services = Object.keys(found).filter(
        (key) => found[key] === 1 && key !== "tenure" && key !== "id"
      );
      setSelectedServices(services);
    }
  }, [uploadId, id]);

  console.log(result)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Customer Profile
        </h1>

        <div className="w-full max-w-5xl bg-white shadow-xl rounded-3xl p-8 flex flex-col md:flex-row gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0 flex justify-center md:justify-start">
            <Image
              src={img}
              alt="avatar"
              className="w-48 h-48 rounded-full object-cover border-4 border-gray-200"
            />
          </div>

          {/* Info */}
          {result ? (
            <div className="flex-1 flex flex-col md:flex-row gap-10">
              {/* Left column: Basic info */}
              <div className="flex-1 space-y-2">
                <p className="text-2xl font-semibold text-gray-900">
                  {result.userName}
                </p>
                <p className="text-gray-700">Email: {result.email}</p>
                <p className="text-gray-700">Gender: {result.gender}</p>
                <p className="text-gray-700">Tenure: {result.tenure} months</p>
                <p className="text-gray-700">
                  Monthly charges: {result.monthlyCharges}$
                </p>
                <p className="text-gray-700">
                  Total charges: {result.totalCharges}$
                </p>
                <p className="text-gray-700">
                  Contract: {camelToTitle(result.contract)}
                </p>
                <p className="text-gray-700">
                  Internet: {camelToTitle(result.internetService)}
                </p>
                <p className="text-gray-700">
                  Payment: {camelToTitle(result.paymentMethod)}
                </p>
              </div>

              {/* Right column: Services */}
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-3 text-gray-800">
                  Services
                </h2>
                {selectedServices.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {selectedServices.map((ser, idx) => (
                      <li key={idx}>{camelToTitle(ser)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No services</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 text-lg">Loading...</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default ProfilePage;
