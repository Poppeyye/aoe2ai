import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/ai/agent";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    let fullContent = "";

    for await (const event of runAgent(messages)) {
      if (event.type === "text") {
        fullContent += event.content;
      } else if (event.type === "error") {
        return NextResponse.json({ error: event.content }, { status: 500 });
      }
    }

    return NextResponse.json({ content: fullContent });
  } catch (error) {
    console.error("Agent error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
