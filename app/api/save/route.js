// app/api/save/route.js
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

function toCamelValue(value) {
  if (typeof value !== "string") return value;
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}
function normalizeCamelKeys(arr) {
  return arr.map((item) => {
    const newItem = { ...item };

    if ("contract" in newItem) {
      newItem.contract = toCamelValue(newItem.contract);
    }
    if ("internetService" in newItem) {
      newItem.internetService = toCamelValue(newItem.internetService);
    }
    if ("paymentMethod" in newItem) {
      newItem.paymentMethod = toCamelValue(newItem.paymentMethod);
    }

    return newItem;
  });
}

export async function POST(req) {
  try {
    const { data, userId } = await req.json();
    if (!userId || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "Missing userId or data array" },
        { status: 400 }
      );
    }

    const formattedData = normalizeCamelKeys(data);

    const finalData = formattedData.map((item) => {
      const genderValue =
        item.gender === 1 ? "female" : item.gender === 0 ? "male" : item.gender; // giữ nguyên nếu không phải 0/1
      return { ...item, gender: genderValue };
    });

    const db = await connectDB();

    // Lưu cả mảng data vào 1 document, kèm userId
    const upload = await db.collection("upload").insertOne({
      userId: new ObjectId(userId),
      data: finalData, // lưu nguyên array
    });

    // Trả về id của document vừa lưu
    return NextResponse.json({
      message: "Saved successfully",
      data: finalData,
      userId,
      _id: upload.insertedId,
    });
  } catch (err) {
    console.error("Error saving data:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
