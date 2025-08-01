// scripts/testEmbedding.ts
import { HfInference } from "@huggingface/inference";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../.env.local") });

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY!);

async function testEmbedding() {
  try {
    const embedding = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: "milk",
    });
    console.log("Embedding length:", embedding.length);
    console.log("Embedding:", JSON.stringify(embedding));
  } catch (error) {
    console.error("Hugging Face error:", error);
  }
}

testEmbedding();