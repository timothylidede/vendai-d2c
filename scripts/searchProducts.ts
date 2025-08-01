import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { config } from 'dotenv';
import path from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;

// Load query cache
const cacheFile = path.join(__dirname, 'query_cache.json');
let queryCache = new Map<string, string[]>();
if (existsSync(cacheFile)) {
  queryCache = new Map(Object.entries(JSON.parse(readFileSync(cacheFile, 'utf-8'))));
}

async function searchProducts(query: string, limit: number = 10, retries: number = 3) {
  try {
    // Check cache first
    if (queryCache.has(query)) {
      console.log(`Using cached keywords for query: "${query}"`);
      const keywords = queryCache.get(query)!;
      const tsQuery = keywords.map((k: string) => `${k}:*`).join(' & ');
      const { data, error } = await supabase
        .from('product_embeddings')
        .select('product_id, name, description, category, brand, price, distributor_name')
        .textSearch('search_vector', tsQuery, { config: 'english' })
        .order('rank', { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      console.log(`Found ${data.length} matching products`);
      return data;
    }

    // Enhance query with DeepSeek
    console.log(`Enhancing query: "${query}"`);
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const deepseekResponse = await axios.post(
          'https://api.deepseek.com/v1/chat/completions', // Replace with actual endpoint
          {
            model: 'deepseek-rag', // Replace with correct model
            messages: [
              {
                role: 'user',
                content: `Extract search keywords and synonyms for: "${query}"`,
              },
            ],
          },
          {
            headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}` },
            timeout: 30000,
          }
        );

        const keywords = deepseekResponse.data.choices[0].message.content
          .split(' ')
          .filter((k: string) => k.length > 1);
        console.log('DeepSeek keywords:', keywords);

        // Cache the keywords
        queryCache.set(query, keywords);
        writeFileSync(cacheFile, JSON.stringify(Object.fromEntries(queryCache), null, 2));

        // Perform full-text search
        const tsQuery = keywords.map((k: string) => `${k}:*`).join(' & ');
        console.log('TS Query:', tsQuery);
        const { data, error } = await supabase
          .from('product_embeddings')
          .select('product_id, name, description, category, brand, price, distributor_name')
          .textSearch('search_vector', tsQuery, { config: 'english' })
          .order('rank', { ascending: false })
          .limit(limit);
        if (error) throw new Error(error.message);

        console.log(`Found ${data.length} matching products`);
        return data;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt} failed for query "${query}":`, error);
        if (attempt < retries) await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
    throw lastError || new Error('Failed to process query with DeepSeek');
  } catch (error) {
    console.error('Search failed:', error);
    // Fallback to plain full-text search
    const tsQuery = query.split(' ').map(k => `${k}:*`).join(' & ');
    const { data, error: fallbackError } = await supabase
      .from('product_embeddings')
      .select('product_id, name, description, category, brand, price, distributor_name')
      .textSearch('search_vector', tsQuery, { config: 'english' })
      .order('rank', { ascending: false })
      .limit(limit);
    if (fallbackError) {
      console.error('Fallback search failed:', fallbackError.message);
      return [];
    }
    console.log(`Fallback search found ${data.length} matching products`);
    return data;
  }
}

async function main() {
  const queries = ['orange juice', 'Safari Pure 1kg', 'milk', 'budget beverage'];
  for (const query of queries) {
    console.log(`\n🔍 Searching for: ${query}`);
    const results = await searchProducts(query);
    console.log('Results:', results);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Search failed:', error);
    process.exit(1);
  });
}

export { searchProducts };