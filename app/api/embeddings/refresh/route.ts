import { NextResponse } from "next/server"
import { refreshAllEmbeddings } from "@/lib/embeddings-service"

export async function POST() {
  try {
    const success = await refreshAllEmbeddings()

    if (success) {
      return NextResponse.json({
        success: true,
        message: "All embeddings refreshed successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to refresh embeddings",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in embeddings refresh API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
