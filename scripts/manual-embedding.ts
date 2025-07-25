import { InferenceClient } from '@huggingface/inference'
import fs from 'fs'
import path from 'path'
import { PRODUCTS } from '../data/products'

const hf = new InferenceClient('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')

const failed: string[] = []

async function embedProduct(product: { id: number; name: string; description: string }) {
  const text = `${product.name}. ${product.description}`.trim()

  if (!text) throw new Error('Empty text for embedding')

  const embedding = await hf.featureExtraction({
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    inputs: text,
  })

  return embedding
}

async function run(startIndex = 0, batchSize = 100) {
  const products = PRODUCTS.slice(startIndex, startIndex + batchSize)

  for (const product of products) {
    try {
      const vector = await embedProduct(product)
      console.log(`✅ Embedded: ${product.name}`)

      const outDir = path.join(__dirname, '../output')
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)
      fs.writeFileSync(
        path.join(outDir, `embedding-${product.id}.json`),
        JSON.stringify({ id: product.id, vector }, null, 2)
      )

      await new Promise((res) => setTimeout(res, 200)) // optional delay
    } catch (err) {
      console.error(`❌ Failed: ${product.name}`)
      failed.push(product.name)
    }
  }

  if (failed.length) {
    const failedPath = path.join(__dirname, '../output/failed-products.json')
    fs.writeFileSync(failedPath, JSON.stringify(failed, null, 2))
    console.log(`⚠️ Logged ${failed.length} failed products to failed-products.json`)
  }
}

const arg = process.argv[2]
run(arg ? parseInt(arg, 10) : 0)
