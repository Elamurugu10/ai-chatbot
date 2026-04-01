import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // REQUIRED
        "X-Title": "AI Chatbot Project"          // REQUIRED
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: messages
      })
    });

    const data = await response.json();

    // Debug log (optional)
    console.log(data);

    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({
      error: "Server error"
    });
  }
}