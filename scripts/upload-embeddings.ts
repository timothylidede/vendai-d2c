import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import path from "path";
import { config } from "dotenv"; // Load .env
import { PRODUCTS } from "@/data/products"; // Adjust path as needed

// Explicitly set the path to the .env.local file in the project root
const envPath = path.resolve(__dirname, "../.env.local");
const result = config({ path: envPath });
console.log("dotenv result:", result);
console.log("Loaded env variables:", process.env);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
);

interface ProductEmbedding {
  product_id: number;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  wholesale_price: number;
  keywords: string[];
  embedding: number[] | null;
}

async function generateKeywords(product: typeof PRODUCTS[number]): Promise<string[]> {
  const keywords = new Set<string>();
  const safeName = product.name || "unknown";
  const safeDescription = product.description || "no description";
  const safeCategory = product.category || "uncategorized";
  const safeBrand = product.brand || "";
  const safeUnit = product.unit || "";

  safeName
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .forEach((word) => keywords.add(word));
  safeDescription
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .forEach((word) => keywords.add(word));
  safeCategory
    .toLowerCase()
    .split(/[&,\s]+/)
    .forEach((part) => {
      if (part.length > 2) keywords.add(part.trim());
    });
  if (safeBrand) keywords.add(safeBrand.toLowerCase());
  if (safeUnit) keywords.add(safeUnit.toLowerCase());

  const synonymMap: { [key: string]: string[] } = {
    juice: ["drink", "beverage", "liquid"],
  };
  Array.from(keywords).forEach((keyword) => {
    if (synonymMap[keyword]) {
      synonymMap[keyword].forEach((synonym) => keywords.add(synonym));
    }
  });

  return Array.from(keywords).filter((keyword) => keyword.length > 1);
}

async function uploadEmbeddings() {
  const outputDir = path.join(process.cwd(), "output");
  if (!fs.existsSync(outputDir)) {
    console.error("Output directory not found:", outputDir);
    return;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in the environment.");
    console.error("Available env vars:", Object.keys(process.env));
    return;
  }

  for (const file of fs.readdirSync(outputDir)) {
    if (file.endsWith(".json")) {
      const filePath = path.join(outputDir, file);
      const embeddingData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const productId = embeddingData.id;

      const product = PRODUCTS.find((p) => p.id === productId);
      if (product) {
        const embedding: ProductEmbedding = {
          product_id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          brand: product.brand || "",
          price: product.price,
          wholesale_price: product.wholesalePrice,
          keywords: await generateKeywords(product),
          embedding: embeddingData.vector,
        };

        try {
          const { error } = await supabaseAdmin
            .from("product_embeddings")
            .upsert(embedding, { onConflict: "product_id" });

          if (error) {
            console.error(`Error uploading ${file}:`, error.message);
          } else {
            console.log(`Uploaded ${file} for product ID ${product.id}`);
          }
        } catch (error) {
          console.error(`Unexpected error uploading ${file}:`, error);
        }
      } else {
        console.warn(`No product found for embedding ID ${embeddingData.id} in ${file}`);
      }
    }
  }
}

uploadEmbeddings().catch((error) => {
  console.error("Upload failed:", error);
});