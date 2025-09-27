import { NextResponse } from "next/server";
import { Resend } from "resend";

// Khởi tạo Resend client với API key từ .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { email, userName, churnProbability } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Gửi email
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL, // VD: "Your App <noreply@yourdomain.com>"
      to: email,
      subject: "Customer Churn Notification",
      text: `Hello ${userName},\n\nOur system predicts that your churn probability is ${(
        churnProbability * 100
      ).toFixed(2)}%.\n\nBest regards,\nSupport Team`,
    });

    return NextResponse.json({ message: "Email sent successfully", data });
  } catch (err) {
    console.error("Error sending email:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
