import ollama from 'ollama';
import Database from 'better-sqlite3';

const db: Database.Database = new Database('embedblob.db');
const sessionId: string = 'testUser';

// Register cosine_similarity for SQLite
db.function('cosine_similarity', (vec1: Buffer | Float32Array, vec2: Buffer | Float32Array): number => {
    // Convert inputs to Float32Array consistently
    const v1: Float32Array = vec1 instanceof Buffer 
        ? new Float32Array(vec1.buffer, vec1.byteOffset, vec1.length / 4) 
        : new Float32Array(vec1); // Ensure a new Float32Array copy to avoid type issues
    const v2: Float32Array = vec2 instanceof Buffer 
        ? new Float32Array(vec2.buffer, vec2.byteOffset, vec2.length / 4) 
        : new Float32Array(vec2);

    if (v1.length !== v2.length) throw new Error("Vectors must be of the same length.");
    let dot: number = 0, norm1Sq: number = 0, norm2Sq: number = 0;
    for (let i: number = 0; i < v1.length; i++) {
        const a: number = v1[i];
        const b: number = v2[i];
        dot += a * b;
        norm1Sq += a * a;
        norm2Sq += b * b;
    }
    const normProduct: number = Math.sqrt(norm1Sq) * Math.sqrt(norm2Sq);
    return normProduct === 0 ? 0 : dot / normProduct;
});

/**
 * Generates embeddings for a user query
 * @param query - The user's input
 * @returns A promise resolving to a Float32Array of embeddings
 */
async function EmbedUserQuery(query: string): Promise<Float32Array> {
    const res = await ollama.embed({
        model: "mxbai-embed-large",
        truncate: true,
        input: query,
    });
    return new Float32Array(res.embeddings.flat());
}

/**
 * Retrieves similar content from the database based on an embedding
 * @param f - An embedding of the user input
 * @returns The most similar content from the database
 */
const getSimilarContentFromDb = (f: Float32Array): string => {
    const embeddingBuffer: Buffer = Buffer.from(f.buffer);
    const rows: { content: string; similarity: number }[] = db.prepare(
        "SELECT *, cosine_similarity(embeddings, ?) AS similarity FROM embeddings WHERE sessid = ? ORDER BY similarity DESC LIMIT 3"
    ).all(embeddingBuffer, sessionId) as { content: string; similarity: number }[];
    return rows[0].content;
};

/**
 * Gets contextually similar content for a given query
 * @param query - The user's input
 * @returns A promise resolving to similar content from the database
 */
export const getContext = async (query: string): Promise<string> => {
    const embedding: Float32Array = await EmbedUserQuery(query);
    const similarContent: string = getSimilarContentFromDb(embedding);
    return similarContent;
};

// Run the function and handle the Promise
(async (): Promise<void> => {
    try {
        const result: string = await getContext("I need some kamande");
        console.log(result);
    } catch (error: unknown) {
        console.error("Error:", error);
    }
})();