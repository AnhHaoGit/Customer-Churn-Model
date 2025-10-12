import { NextResponse } from "next/server";
import { Resend } from "resend";
import { MongoClient, ObjectId } from "mongodb";

// Initialize Resend client using your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// MongoDB setup
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
  try {
    const { email, userName, churnProbability, uploadId } = await req.json();

    if (!email || !uploadId) {
      return NextResponse.json(
        { error: "Missing email or uploadId" },
        { status: 400 }
      );
    }

    // Determine voucher level based on churn probability
    let voucher = "";
    if (churnProbability >= 0.8) {
      voucher = "STAYWITHUS30"; // 30% off
    } else if (churnProbability >= 0.5) {
      voucher = "KEEP20"; // 20% off
    } else {
      voucher = "THANKYOU10"; // 10% off
    }

    // HTML email body
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 24px; border-radius: 12px; color: #333;">
        <h2 style="color: #0070f3;">Hi ${userName},</h2>

        <p>We truly value having you as part of our community and we’d love the chance to keep working with you. 
        As a token of appreciation, we’re offering you a <strong>special discount voucher</strong> to help you stay with us:</p>

        <div style="text-align: center; margin: 20px 0;">
          <div style="display: inline-block; background-color: #0070f3; color: white; padding: 14px 28px; border-radius: 8px; font-size: 18px; letter-spacing: 1px;">
            ${voucher}
          </div>
          <p style="font-size: 14px; color: #555; margin-top: 8px;">Use this code to get a discount when renewing or upgrading your plan within the next 7 days.</p>
        </div>

        <p>If there’s anything we can do to improve your experience — whether it’s product issues, missing features, or support requests — our team is always here to help.</p>

        <p>Thank you for being with us. We hope to continue bringing you great value and helping you reach your goals.</p>

        <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 14px; color: #888;">Warm regards,<br>
        <strong>Customer Success Team</strong><br>
        Telco Company Analytics</p>
      </div>
    `;

    // Send email via Resend
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL, // e.g. "MagicSub Team <noreply@magicsub.com>"
      to: email,
      subject: "🎁 A Special Offer Just for You from Telco Company",
      html: emailHtml,
    });

    // After sending email, update MongoDB
    const db = await connectDB();
    const uploads = db.collection("upload");

    // Update the matching customer in the array and add sentEmail:true (if missing)
    const updateResult = await uploads.updateOne(
      {
        _id: new ObjectId(uploadId),
        "data.email": email,
      },
      {
        $set: { "data.$.sentEmail": true },
      }
    );

    return NextResponse.json({
      message: "Email sent and database updated successfully",
      emailResponse: data,
      dbUpdate: updateResult,
    });
  } catch (err) {
    console.error("Error sending email or updating DB:", err);
    return NextResponse.json(
      { error: "Failed to send email or update database" },
      { status: 500 }
    );
  }
}
