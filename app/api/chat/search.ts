/*
// app/api/chat/search.ts
import { PRODUCTS } from "@/data/products";
import { LRUCache as LRU } from "lru-cache";
import type { Product } from "@/lib/types";
import Database from "better-sqlite3";

const cache = new LRU<string, { products: Product[]; context: string }>({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

const synonymMap = new Map([
  ["eggs", ["egg", "mayai", "yai", "kuku"]],
  ["juice", ["maji ya matunda", "drink", "beverage"]],
  ["water", ["maji"]],
]);

interface SearchResult {
  products: Product[];
  context: string;
}

const db = new Database("embedblob.db", { readonly: true });
const cosineSimilarity = (a: Float32Array, b: Float32Array): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export async function searchProductsAndContext(query: string): Promise<SearchResult> {
  const searchTerm = query.toLowerCase().trim();
  const cacheKey = searchTerm;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Generate embedding for query
  let queryEmbedding: Float32Array;
  try {
    const res = await import("ollama").then((ollama) =>
      ollama.embed({
        model: "mxbai-embed-large",
        truncate: true,
        input: searchTerm,
      })
    );
    queryEmbedding = new Float32Array(res.embeddings.flat());
  } catch (error) {
    console.error("Ollama embedding failed:", error);
    queryEmbedding = null; // Fallback to keyword search
  }

  const results: Array<Product & { relevanceScore: number }> = [];
  if (queryEmbedding) {
    // Query SQLite for similar products
    const stmt = db.prepare("SELECT id, name, content, embeddings FROM embeddings WHERE sessid = ?");
    const rows = stmt.all("testUser");

    for (const row of rows) {
      const productEmbedding = new Float32Array(new Uint8Array(row.embeddings).buffer);
      const score = cosineSimilarity(queryEmbedding, productEmbedding);
      if (score > 0.8) {
        const product = PRODUCTS.find((p) => p.id.toString() === row.id);
        if (product) {
          results.push({ ...product, relevanceScore: score * 1000 });
        }
      }
    }
  }

  // Fallback to keyword search if no embedding matches or embedding failed
  if (results.length === 0) {
    const queryWords = searchTerm.split(" ").filter((word) => word.length > 2);
    for (const product of PRODUCTS) {
      const searchableText = `${product.name} ${product.description} ${product.category} ${product.brand || ""}`.toLowerCase();
      let score = 0;
      if (searchableText.includes(searchTerm)) {
        score = 1000;
      } else {
        for (const word of queryWords) {
          if (searchableText.includes(word)) score += 100;
          const synonyms = synonymMap.get(word);
          if (synonyms) {
            for (const synonym of synonyms) {
              if (searchableText.includes(synonym)) {
                score += 80;
                break;
              }
            }
          }
        }
        if (product.category.toLowerCase().includes(searchTerm)) score += 150;
        if (product.brand && product.brand.toLowerCase().includes(searchTerm)) score += 120;
      }
      if (score >= 50) {
        results.push({ ...product, relevanceScore: score });
      }
    }
  }

  const sortedProducts = results
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 8) as Product[];

  const context = sortedProducts.length
    ? sortedProducts
        .map((p) => `ID: ${p.id}, Name: ${p.name}, Price: KES ${p.wholesalePrice || p.price || 0}, Brand: ${p.brand || "Generic"}, Description: ${p.description}`)
        .join("\n")
    : "No products found matching the search criteria.";

  const result = { products: sortedProducts, context };
  cache.set(cacheKey, result);
  return result;
}
  */