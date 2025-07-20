import ollama from "ollama"
import Database from "better-sqlite3"

const db: Database.Database = new Database("embedblob.db")
const sessionId: string = "testUser"

// Register cosine_similarity for SQLite
db.function("cosine_similarity", (vec1: Buffer | Float32Array, vec2: Buffer | Float32Array): number => {
  // Convert inputs to Float32Array consistently
  const v1: Float32Array =
    vec1 instanceof Buffer ? new Float32Array(vec1.buffer, vec1.byteOffset, vec1.length / 4) : new Float32Array(vec1)

  const v2: Float32Array =
    vec2 instanceof Buffer ? new Float32Array(vec2.buffer, vec2.byteOffset, vec2.length / 4) : new Float32Array(vec2)

  if (v1.length !== v2.length) throw new Error("Vectors must be of the same length.")

  let dot = 0,
    norm1Sq = 0,
    norm2Sq = 0

  for (let i = 0; i < v1.length; i++) {
    const a: number = v1[i]
    const b: number = v2[i]
    dot += a * b
    norm1Sq += a * a
    norm2Sq += b * b
  }

  const normProduct: number = Math.sqrt(norm1Sq) * Math.sqrt(norm2Sq)
  return normProduct === 0 ? 0 : dot / normProduct
})

/**
 * Generates embeddings for a user query
 */
async function EmbedUserQuery(query: string): Promise<Float32Array> {
  try {
    const res = await ollama.embed({
      model: "mxbai-embed-large",
      truncate: true,
      input: query,
    })
    return new Float32Array(res.embeddings.flat())
  } catch (error) {
    console.error("Error generating embeddings:", error)
    // Return empty embedding as fallback
    return new Float32Array(1024).fill(0)
  }
}

/**
 * Retrieves similar content from the database based on an embedding
 */
const getSimilarContentFromDb = (f: Float32Array): string => {
  try {
    const embeddingBuffer: Buffer = Buffer.from(f.buffer)

    const rows: { content: string; similarity: number }[] = db
      .prepare(
        "SELECT *, cosine_similarity(embeddings, ?) AS similarity FROM embeddings WHERE sessid = ? ORDER BY similarity DESC LIMIT 3",
      )
      .all(embeddingBuffer, sessionId) as { content: string; similarity: number }[]

    if (rows.length === 0) {
      console.log("No similar content found in database")
      return "No relevant product information found."
    }

    console.log(
      `Found ${rows.length} similar items with similarities:`,
      rows.map((r) => r.similarity),
    )

    // Combine top results
    return rows.map((row) => row.content).join("\n\n")
  } catch (error) {
    console.error("Error querying database:", error)
    return "Error retrieving product information."
  }
}

/**
 * Gets contextually similar content for a given query
 */
export const getContext = async (query: string): Promise<string> => {
  try {
    console.log("Getting context for query:", query)
    const embedding: Float32Array = await EmbedUserQuery(query)
    const similarContent: string = getSimilarContentFromDb(embedding)
    console.log("Context retrieved, length:", similarContent.length)
    return similarContent
  } catch (error) {
    console.error("Error getting context:", error)
    return "Unable to retrieve context at this time."
  }
}
