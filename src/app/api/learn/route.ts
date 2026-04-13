import { NextRequest, NextResponse } from "next/server";
import { analyzeVideo } from "@/lib/ai/replay-analyzer";

export async function POST(req: NextRequest) {
  try {
    const { url, transcript, question } = await req.json();

    if (!transcript && !url) {
      return NextResponse.json(
        { error: "Provide a YouTube URL or paste a transcript" },
        { status: 400 }
      );
    }

    let text = transcript || "";

    // If URL is provided but no transcript, try to extract video ID for reference
    let videoId = "";
    if (url) {
      const match = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
      );
      videoId = match?.[1] || "";
    }

    if (!text) {
      return NextResponse.json({
        summary:
          "YouTube blocks transcript requests from cloud servers. Please paste the transcript manually using the instructions on the page.",
        keyTakeaways: [],
        buildOrders: [],
        strategies: [],
        videoId,
      });
    }

    const analysis = await analyzeVideo(text, question || undefined);

    return NextResponse.json({
      ...analysis,
      videoId,
    });
  } catch (error) {
    console.error("Learn error:", error);
    return NextResponse.json(
      { error: "Failed to analyze video" },
      { status: 500 }
    );
  }
}
