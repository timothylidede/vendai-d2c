import { NextResponse } from "next/server";
import { initializeEmbeddings } from "@/lib/embeddings-service";

export async function POST(request: Request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    await request.json(); // Parse body to ensure it's valid JSON
    const success: boolean = await initializeEmbeddings();

    clearTimeout(timeoutId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Embeddings initialized successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to initialize embeddings",
        },
        { status: 500 },
      );
    }
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    console.error("Error in embeddings init API:", error);
    const typedError = error as Error;
    if (typedError.name === "AbortError") {
      return NextResponse.json(
        {
          success: false,
          message: "Embedding initialization timed out",
        },
        { status: 504 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during embedding initialization",
        error: process.env.NODE_ENV === "development" ? typedError.message : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to initialize embeddings",
    endpoint: "/api/embeddings/init",
    method: "POST",
    example: {
      body: "{}",
    },
  });
}