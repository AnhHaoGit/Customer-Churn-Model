import { NextResponse } from "next/server";

export async function POST(req) {
  const { data } = await req.json();

  const formattedData = formatData(data);

  try {
    const res = await fetch("http://localhost:8000/single-customer", {
      method: "POST",
      body: JSON.stringify(formattedData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error uploading CSV:", err);
  }
}

const oneHot = (value, options, prefix) => {
  const result = {};
  options.forEach((opt) => {
    result[`${prefix}_${opt}`] = value === opt ? 1 : 0;
  });
  return result;
};

const formatData = (data) => {
  const newData = { ...data };

  // gender
  newData.gender = newData.gender === "Male" ? 1 : 0;

  

  // contract
  Object.assign(
    newData,
    oneHot(newData.contract, ["monthToMonth", "oneYear", "twoYear"], "contract")
  );
  delete newData.contract;

  // internet
  Object.assign(
    newData,
    oneHot(
      newData.internetService,
      ["dsl", "fiberOptic", "no"],
      "internetService"
    )
  );
  delete newData.internetService;

  // payment
  Object.assign(
    newData,
    oneHot(
      newData.paymentMethod,
      [
        "bankTransferAutomatic",
        "creditCardAutomatic",
        "electronicCheck",
        "mailedCheck",
      ],
      "paymentMethod"
    )
  );
  delete newData.paymentMethod;

  return newData;
};
