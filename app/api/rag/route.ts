import { NextResponse } from "next/server";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "No question" }, { status: 400 });
    }

    const knowledge = fs.readFileSync("app/data/knowledge.txt", "utf-8");

    const prompt = `
Use the following knowledge to answer:

${knowledge}

Question: ${question}
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          { role: "user", content: prompt }
        ],
      }),
    });

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error("RAG Error:", error);
    return NextResponse.json({ error: "RAG failed" }, { status: 500 });
  }
}