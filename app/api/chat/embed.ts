import { readFileSync, readdirSync } from "fs";
import ollama from "ollama";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";

// Instantiate database
const db: Database.Database = new Database("embedblob.db");
const sessionKey: string = "testUser";
db.exec(`
    CREATE TABLE IF NOT EXISTS embeddings (
      id TEXT PRIMARY KEY,
      sessid TEXT,
      name TEXT,
      content TEXT,
      embeddings BLOB
    );

    PRAGMA journal_mode = WAL;  -- Better write performance
`);

// Define interfaces
interface Meta {
  session: string;
  name: string;
  model?: string;
}

/**
 * Saves embeddings to the database
 * @param embeddings - The embeddings to save
 * @param meta - Metadata for the embedding
 * @param content - The content associated with the embedding
 */
async function saveToDb(embeddings: Float32Array, meta: Meta, content: string): Promise<void> {
  const transaction = db.transaction(() => {
    const stmt = db.prepare(`
        INSERT INTO embeddings
        VALUES (?, ?, ?, ?, ?)
    `);
    const id: string = uuidv4();
    stmt.run(id, meta.session, meta.name, content, Buffer.from(embeddings.buffer));
  });

  transaction();
}

/**
 * Generates and saves embeddings for content
 * @param content - The content to embed
 * @param meta - Metadata for the embedding
 */
async function Embed(content: string, meta: Meta): Promise<void> {
  const res = await ollama.embed({
    model: "mxbai-embed-large",
    truncate: true,
    input: content,
  });
  
  meta.model = res.model;
  const embeddings: Float32Array = new Float32Array(res.embeddings.flat());
  await saveToDb(embeddings, meta, content);
}

// Read files and embed them
const data: Record<string, unknown> = {};
const files: string[] = readdirSync(`./data`);
for (const f of files) {
  const content: string = readFileSync(`./data/${f}`, "utf-8");
  Embed(content, { session: sessionKey, name: f });
}