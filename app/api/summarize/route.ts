import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          {
            role: "system",
            content: "Summarize the following text in a short and clear way."
          },
          {
            role: "user",
            content: text
          }
        ],
      }),
    });

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error("Summarize Error:", error);
    return NextResponse.json(
      { error: "Summarization failed" },
      { status: 500 }
    );
  }
}