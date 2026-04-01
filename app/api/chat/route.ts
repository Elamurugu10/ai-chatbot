import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ai-chatbot-v1.vercel.app", // your deployed URL
        "X-Title": "AI Chatbot Project"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct", // ✅ WORKING MODEL
        messages: messages
      }),
    });

    const data = await response.json();

    console.log("OPENROUTER RESPONSE:", data);

    return NextResponse.json(data);

  } catch (error) {
    console.error("ERROR:", error);
    return NextResponse.json({ error: "Server error" });
  }
}