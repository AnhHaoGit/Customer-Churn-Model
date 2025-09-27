import { NextResponse } from "next/server";
import OpenAI from "openai";

// API route runs on the server, so your key stays private
export async function POST(req) {
  try {
    const data = await req.json(); // receive customer data from the frontend

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // set this in your environment variables
    });

    const prompt = `
      Here is the customer's information: ${JSON.stringify(data)}.
      Based on these details, analyze the key factors that may lead to churn (customer leaving the service).
      Provide a detailed explanation of possible reasons and suggest strategies to reduce churn.
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // you can change to gpt-4o or gpt-4-turbo depending on your plan
      messages: [
        { role: "system", content: "You are a customer analytics expert." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const analysis =
      response.choices?.[0]?.message?.content || "No analysis result.";

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again later." },
      { status: 500 }
    );
  }
}
