import { NextResponse } from "next/server"
import { initializeEmbeddings } from "@/lib/embeddings-service"

export async function POST() {
  try {
    const success = await initializeEmbeddings()

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Embeddings initialized successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to initialize embeddings",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in embeddings init API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to initialize embeddings",
    endpoint: "/api/embeddings/init",
  })
}
