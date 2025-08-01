import { createClient } from "@supabase/supabase-js";
import { HfInference } from "@huggingface/inference";
import { config } from "dotenv";
import { writeFileSync, readFileSync, existsSync } from "fs";
import path from "path";
import { PRODUCTS } from "../data/products";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  wholesalePrice: number;
  category: string;
  brand?: string;
  image?: string;
  inStock: boolean;
  stock?: number;
  unit: string;
  code?: string;
  size?: string;
  wholesaleQuantity?: number;
  distributorName?: string;
}

interface ProductEmbedding {
  product_id: number;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  wholesale_price: number;
  distributor_name: string;
  unit: string;
  code: string;
  size: string;
  wholesale_quantity: number;
  keywords: string[];
  enhanced_text: string;
  embedding: number[] | null;
  text_hash: string;
  created_at?: string;
  updated_at?: string;
}

// Enhanced text preprocessing
class TextProcessor {
  private static readonly STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'
  ]);

  private static readonly CATEGORY_SYNONYMS: { [key: string]: string[] } = {
    // Beverages
    juice: ["drink", "beverage", "liquid", "refreshment", "nectar"],
    milk: ["dairy", "cream", "beverage", "liquid"],
    water: ["liquid", "beverage", "drink", "hydration"],
    soda: ["soft drink", "carbonated", "beverage", "fizzy"],
    tea: ["beverage", "brew", "infusion", "drink"],
    coffee: ["beverage", "brew", "drink", "caffeine"],
    
    // Food items
    bread: ["loaf", "baked", "bakery", "carb", "staple"],
    rice: ["grain", "staple", "cereal", "carb"],
    pasta: ["noodles", "grain", "carb", "italian"],
    meat: ["protein", "beef", "pork", "chicken", "flesh"],
    fish: ["seafood", "protein", "aquatic"],
    vegetable: ["veggie", "produce", "plant", "green"],
    fruit: ["produce", "sweet", "natural", "vitamin"],
    
    // Household
    soap: ["cleaner", "detergent", "hygiene", "wash"],
    shampoo: ["hair care", "cleaner", "hygiene", "wash"],
    tissue: ["paper", "hygiene", "soft", "disposable"],
    
    // Common units and sizes
    kg: ["kilogram", "kilo", "weight"],
    ml: ["milliliter", "volume", "liquid"],
    liter: ["litre", "volume", "liquid"],
    pack: ["package", "bundle", "set"],
    bottle: ["container", "vessel"],
    can: ["tin", "container"],
    box: ["carton", "package", "container"]
  };

  static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static extractKeywords(text: string, minLength: number = 2): string[] {
    const normalized = this.normalizeText(text);
    const words = normalized.split(' ');
    
    const keywords = new Set<string>();
    
    // Add individual words
    words
      .filter(word => word.length >= minLength && !this.STOP_WORDS.has(word))
      .forEach(word => keywords.add(word));
    
    // Add 2-grams for better context
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      if (bigram.length > 4 && !this.STOP_WORDS.has(words[i]) && !this.STOP_WORDS.has(words[i + 1])) {
        keywords.add(bigram);
      }
    }
    
    return Array.from(keywords);
  }

  static expandWithSynonyms(keywords: string[]): string[] {
    const expanded = new Set(keywords);
    
    keywords.forEach(keyword => {
      if (this.CATEGORY_SYNONYMS[keyword]) {
        this.CATEGORY_SYNONYMS[keyword].forEach(synonym => expanded.add(synonym));
      }
    });
    
    return Array.from(expanded);
  }
}

// Enhanced embedding generator
class EmbeddingGenerator {
  private hf: HfInference;
  private cache: Map<string, number[]>;
  private cacheFile: string;

  constructor(hf: HfInference) {
    this.hf = hf;
    this.cache = new Map();
    this.cacheFile = path.join(__dirname, "embeddings_cache.json");
    this.loadCache();
  }

  private loadCache(): void {
    try {
      if (existsSync(this.cacheFile)) {
        const cacheData = JSON.parse(readFileSync(this.cacheFile, 'utf-8'));
        this.cache = new Map(Object.entries(cacheData));
        console.log(`Loaded ${this.cache.size} cached embeddings`);
      }
    } catch (error) {
      console.warn("Failed to load embedding cache:", error);
      this.cache = new Map();
    }
  }

  private saveCache(): void {
    try {
      const cacheObj = Object.fromEntries(this.cache);
      writeFileSync(this.cacheFile, JSON.stringify(cacheObj, null, 2));
      console.log(`Saved ${this.cache.size} embeddings to cache`);
    } catch (error) {
      console.error("Failed to save embedding cache:", error);
    }
  }

  private createTextHash(text: string): string {
    // Simple hash function for text change detection
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private buildEnhancedText(product: Product): string {
    const parts = [];
    
    // Primary product information (weighted higher)
    if (product.name) parts.push(`Product: ${product.name}`);
    if (product.description) parts.push(`Description: ${product.description}`);
    if (product.category) parts.push(`Category: ${product.category}`);
    
    // Brand and distributor information
    if (product.brand) parts.push(`Brand: ${product.brand}`);
    if (product.distributorName && product.distributorName !== "Unknown Distributor") {
      parts.push(`Distributor: ${product.distributorName}`);
    }
    
    // Product specifications
    if (product.unit) parts.push(`Unit: ${product.unit}`);
    if (product.size) parts.push(`Size: ${product.size}`);
    if (product.code) parts.push(`Code: ${product.code}`);
    
    // Pricing context (useful for similar product matching)
    const priceRange = this.getPriceRange(product.price);
    if (priceRange) parts.push(`Price range: ${priceRange}`);
    
    // Stock and wholesale information
    if (product.wholesaleQuantity && product.wholesaleQuantity > 0) {
      parts.push(`Wholesale available: minimum ${product.wholesaleQuantity} units`);
    }
    
    // Add availability context
    parts.push(`Availability: ${product.inStock ? 'in stock' : 'out of stock'}`);
    
    return parts.join('. ') + '.';
  }

  private getPriceRange(price: number): string {
    if (price < 100) return "budget";
    if (price < 500) return "affordable";
    if (price < 1000) return "mid-range";
    if (price < 2000) return "premium";
    return "luxury";
  }

  async generateKeywords(product: Product): Promise<string[]> {
    const allText = [
      product.name || "",
      product.description || "",
      product.category || "",
      product.brand || "",
      product.distributorName || "",
      product.unit || "",
      product.code || "",
      product.size || ""
    ].join(" ");

    const baseKeywords = TextProcessor.extractKeywords(allText);
    const expandedKeywords = TextProcessor.expandWithSynonyms(baseKeywords);
    
    // Add product-specific keywords
    const specificKeywords = [];
    
    // Add price-based keywords
    if (product.price < 100) specificKeywords.push("cheap", "budget", "affordable");
    if (product.price > 1000) specificKeywords.push("premium", "expensive", "high-end");
    
    // Add stock-based keywords
    if (product.inStock) specificKeywords.push("available", "in-stock");
    if (product.wholesaleQuantity && product.wholesaleQuantity > 0) {
      specificKeywords.push("wholesale", "bulk", "quantity");
    }
    
    return [...expandedKeywords, ...specificKeywords].filter(k => k.length > 1);
  }

  async generateEmbedding(product: Product, forceRegenerate: boolean = false): Promise<{ embedding: number[], textHash: string, enhancedText: string }> {
    const enhancedText = this.buildEnhancedText(product);
    const textHash = this.createTextHash(enhancedText);
    
    // Check cache first
    if (!forceRegenerate && this.cache.has(textHash)) {
      console.log(`Using cached embedding for product ${product.id}`);
      return {
        embedding: this.cache.get(textHash)!,
        textHash,
        enhancedText
      };
    }

    try {
      console.log(`Generating embedding for product ${product.id}: ${product.name}`);
      console.log(`Enhanced text: ${enhancedText.substring(0, 100)}...`);
      
      const result = await this.hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: enhancedText,
      });

      let embeddingArray: number[];
      
      if (Array.isArray(result)) {
        if (Array.isArray(result[0])) {
          // Handle nested array case
          embeddingArray = result[0] as number[];
        } else {
          embeddingArray = result as number[];
        }
      } else {
        throw new Error(`Unexpected embedding format for product ${product.id}`);
      }

      if (embeddingArray.length !== 384) {
        throw new Error(`Invalid embedding length ${embeddingArray.length} for product ${product.id}, expected 384`);
      }

      // Normalize the embedding vector (improves similarity search accuracy)
      const magnitude = Math.sqrt(embeddingArray.reduce((sum, val) => sum + val * val, 0));
      const normalizedEmbedding = embeddingArray.map(val => val / magnitude);

      // Cache the normalized embedding
      this.cache.set(textHash, normalizedEmbedding);
      
      console.log(`Generated and normalized embedding for product ${product.id} (length: ${normalizedEmbedding.length})`);
      
      return {
        embedding: normalizedEmbedding,
        textHash,
        enhancedText
      };
    } catch (error) {
      console.error(`Failed to generate embedding for product ${product.id}:`, error);
      throw error;
    }
  }

  finalize(): void {
    this.saveCache();
  }
}

// Environment setup
const envPath = path.resolve(__dirname, "../.env.local");
console.log(`Loading environment from: ${envPath}`);

if (!existsSync(envPath)) {
  console.error(`.env.local file not found at: ${envPath}`);
  process.exit(1);
}

config({ path: envPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;

console.log("Environment variables status:");
console.log("SUPABASE_URL:", supabaseUrl ? "✓ Loaded" : "✗ Missing");
console.log("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceRoleKey ? "✓ Loaded" : "✗ Missing");
console.log("HUGGINGFACE_API_KEY:", huggingfaceApiKey ? "✓ Loaded" : "✗ Missing");

if (!supabaseUrl || !supabaseServiceRoleKey || !huggingfaceApiKey) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
const hf = new HfInference(huggingfaceApiKey);

// Main sync function
async function syncProductEmbeddings(options: {
  batchSize?: number;
  forceRegenerate?: boolean;
  rateLimitDelay?: number;
} = {}) {
  const {
    batchSize = 5, // Reduced for better rate limiting
    forceRegenerate = false,
    rateLimitDelay = 3000 // 3 seconds between requests
  } = options;

  if (PRODUCTS.length === 0) {
    console.error("No products found in data/products.ts");
    process.exit(1);
  }

  console.log(`🚀 Starting embedding sync for ${PRODUCTS.length} products`);
  console.log(`Configuration: batchSize=${batchSize}, forceRegenerate=${forceRegenerate}, delay=${rateLimitDelay}ms`);

  const embeddingGenerator = new EmbeddingGenerator(hf);

  try {
    // Fetch existing products from Supabase
    console.log("📥 Fetching existing product embeddings...");
    const { data: existingProducts, error: fetchError } = await supabaseAdmin
      .from("product_embeddings")
      .select("product_id, name, description, category, brand, price, wholesale_price, distributor_name, unit, code, size, wholesale_quantity, text_hash, updated_at, embedding");

    if (fetchError) {
      console.error("Error fetching existing products:", fetchError.message);
      process.exit(1);
    }

    const existingProductMap = new Map(existingProducts?.map((p) => [p.product_id, p]) || []);
    console.log(`📊 Found ${existingProductMap.size} existing products in database`);

    let processedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // Process products in batches
    for (let i = 0; i < PRODUCTS.length; i += batchSize) {
      const batch = PRODUCTS.slice(i, i + batchSize);
      const batchEmbeddings: ProductEmbedding[] = [];

      console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(PRODUCTS.length / batchSize)} (products ${i + 1}-${Math.min(i + batchSize, PRODUCTS.length)})`);

      for (const product of batch) {
        const existing = existingProductMap.get(product.id);
        let needsUpdate = forceRegenerate || !existing;

        // Check if product data has changed
        if (existing && !forceRegenerate) {
          const dataChanged =
            existing.name !== product.name ||
            existing.description !== product.description ||
            existing.category !== product.category ||
            existing.brand !== (product.brand || "") ||
            existing.price !== product.price ||
            existing.wholesale_price !== product.wholesalePrice ||
            existing.distributor_name !== (product.distributorName || "Unknown Distributor") ||
            existing.unit !== (product.unit || "") ||
            existing.code !== (product.code || "") ||
            existing.size !== (product.size || "") ||
            existing.wholesale_quantity !== (product.wholesaleQuantity || 0) ||
            !existing.embedding ||
            !existing.text_hash;

          needsUpdate = dataChanged;
        }

        if (needsUpdate) {
          try {
            console.log(`  ⚡ Generating embedding for: ${product.name}`);
            
            // Rate limiting
            if (processedCount > 0) {
              await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
            }

            const keywords = await embeddingGenerator.generateKeywords(product);
            const { embedding, textHash, enhancedText } = await embeddingGenerator.generateEmbedding(product, forceRegenerate);

            batchEmbeddings.push({
              product_id: product.id,
              name: product.name,
              description: product.description,
              category: product.category,
              brand: product.brand || "",
              price: product.price,
              wholesale_price: product.wholesalePrice,
              distributor_name: product.distributorName || "Unknown Distributor",
              unit: product.unit || "",
              code: product.code || "",
              size: product.size || "",
              wholesale_quantity: product.wholesaleQuantity || 0,
              keywords,
              enhanced_text: enhancedText,
              embedding,
              text_hash: textHash
            });

            updatedCount++;
          } catch (error) {
            console.error(`  ❌ Failed to process product ${product.id} (${product.name}):`, error);
          }
        } else {
          console.log(`  ✅ Product ${product.id} is up-to-date`);
          skippedCount++;
        }

        processedCount++;
      }

      // Upsert batch to Supabase
      if (batchEmbeddings.length > 0) {
        console.log(`  💾 Saving ${batchEmbeddings.length} embeddings to database...`);
        
        try {
          const { error } = await supabaseAdmin
            .from("product_embeddings")
            .upsert(batchEmbeddings, { onConflict: "product_id" });

          if (error) {
            console.error(`  ❌ Error upserting batch:`, error.message);
          } else {
            console.log(`  ✅ Successfully saved ${batchEmbeddings.length} products`);
          }
        } catch (error) {
          console.error(`  ❌ Unexpected error upserting batch:`, error);
        }
      }
    }

    // Clean up orphaned products
    console.log("\n🧹 Cleaning up orphaned products...");
    const currentProductIds = PRODUCTS.map(p => p.id);
    const { error: deleteError } = await supabaseAdmin
      .from("product_embeddings")
      .delete()
      .not("product_id", "in", `(${currentProductIds.join(",")})`);

    if (deleteError) {
      console.error("Error deleting orphaned products:", deleteError.message);
    } else {
      console.log("✅ Cleaned up orphaned products");
    }

    // Final summary
    console.log("\n📈 Sync Summary:");
    console.log(`Total products processed: ${processedCount}`);
    console.log(`Products updated: ${updatedCount}`);
    console.log(`Products skipped (up-to-date): ${skippedCount}`);
    console.log(`Success rate: ${((processedCount - (processedCount - updatedCount - skippedCount)) / processedCount * 100).toFixed(1)}%`);

  } finally {
    embeddingGenerator.finalize();
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const forceRegenerate = args.includes('--force') || args.includes('-f');
  const batchSize = parseInt(args.find(arg => arg.startsWith('--batch='))?.split('=')[1] || '5');
  const rateLimitDelay = parseInt(args.find(arg => arg.startsWith('--delay='))?.split('=')[1] || '3000');

  console.log("🎯 Production Embedding Sync");
  console.log("Usage: npm run sync-embeddings [--force] [--batch=5] [--delay=3000]");
  console.log("");

  await syncProductEmbeddings({
    batchSize,
    forceRegenerate,
    rateLimitDelay
  });
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("💥 Sync failed:", error);
    process.exit(1);
  });
}

export { syncProductEmbeddings, EmbeddingGenerator, TextProcessor };