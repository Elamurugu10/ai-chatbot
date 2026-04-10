import { NextResponse } from "next/server";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "No query" }, { status: 400 });
    }

    const text = fs.readFileSync("app/data/knowledge.txt", "utf-8");

    const sentences = text.split("\n");

    const result = sentences.find((line) =>
      line.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({ result: result || "No match found" });

  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}