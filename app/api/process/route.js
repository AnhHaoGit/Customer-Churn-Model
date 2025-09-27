import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db(process.env.MONGODB_DB_NAME || "customer_churn_db");
  }
  return db;
}

export async function POST(req) {
  const { data, userId } = await req.json();

  const formattedData = formatData(data);

  try {
    const res = await fetch("http://localhost:8000/single-customer", {
      method: "POST",
      body: JSON.stringify(formattedData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    data["churn"] = result["churn"];
    data["churnProbability"] = result["churnProbability"];
    data['id'] = result['id']

    const db = await connectDB();

    const upload = await db
      .collection("upload")
      .insertOne({ userId: new ObjectId(userId), data: [data] });

    return NextResponse.json({
      ...result,
      uploadId: upload.insertedId,
      userId,
    });
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
