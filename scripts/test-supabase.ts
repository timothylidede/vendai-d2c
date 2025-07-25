import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Verify environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

console.log("Using Supabase URL:", supabaseUrl);

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testConnection() {
  try {
    // Test connection by querying product_embeddings
    const { data, error } = await supabase.from("product_embeddings").select("*").limit(1);
    if (error) {
      console.error("Supabase connection error:", error.message, error.details, error.hint);
      return;
    }
    console.log("Connection successful. Sample data:", JSON.stringify(data, null, 2));

    // Test query_embeddings table
    const { data: queryData, error: queryError } = await supabase.from("query_embeddings").select("*").limit(1);
    if (queryError) {
      console.error("Query embeddings table error:", queryError.message, queryError.details, queryError.hint);
      return;
    }
    console.log("Query embeddings sample data:", JSON.stringify(queryData, null, 2));
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

testConnection();