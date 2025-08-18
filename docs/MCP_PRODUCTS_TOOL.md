# VendAI MCP Products Tool (No-RAG)

This exposes your `/data/products.ts` dataset as MCP-accessible tools instead of using embeddings / RAG.

## Endpoints (as tools)

- POST `/api/tools/products/search`
  - Body: `{ query: string, filters?: { category?: string, brand?: string, inStock?: boolean } }`
  - Returns: `{ products: Product[] }`

You can map this HTTP endpoint into an MCP server implementation in Node/TS (e.g., using Mastra or a lightweight MCP server), and then connect Cursor/Windsurf to that MCP server.

## Why No-RAG?

- Your dataset is small and structured (products list) → keyword + field filters are fast/sufficient
- Deterministic
- No DB or embedding lifecycle to manage

## Suggested MCP Server Sketch (Mastra-style)

```ts
import { createServer, tool } from "@mastra/mcp" // pseudo API

const searchProducts = tool({
  name: "search_products",
  description: "Search products by keywords and optional filters",
  input: {
    type: "object",
    properties: {
      query: { type: "string" },
      filters: {
        type: "object",
        properties: {
          category: { type: "string" },
          brand: { type: "string" },
          inStock: { type: "boolean" }
        }
      }
    },
    required: ["query"]
  },
  async execute({ query, filters }) {
    const res = await fetch("/api/tools/products/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, filters })
    })
    return await res.json()
  }
})

createServer({ tools: [searchProducts] }).listen(8080)
```

## Client (Cursor/Windsurf)
- Configure MCP client to point to your server
- Tool manifest exposes `search_products` for agent use

## Removing/Disabling Embeddings
- Stop calling: `/api/embeddings/init`, `/api/embeddings/refresh`
- Remove any `lib/embeddings-service.ts` usage
- Ensure chat path calls your new tool (or reuses existing local search) rather than embeddings

## Next Steps
- Add more tools: `get_product_by_id`, `list_categories`, `list_brands`, `check_stock`
- Add auth headers if needed
- Add rate limiting and telemetry
