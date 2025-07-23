import fs from 'fs/promises';
import path from 'path';
import axios, { AxiosError } from 'axios';

// Define interfaces for type safety
interface ProductImage {
  readonly url: string;
  readonly productName: string;
}

interface GoogleSearchResponse {
  readonly items: ReadonlyArray<{
    readonly link: string;
    readonly mime: string;
  }>;
}

// Configuration constants
const PRODUCTS_DIR = 'products';
const GOOGLE_API_BASE_URL = 'https://www.googleapis.com/customsearch/v1';
const API_KEY = process.env.GOOGLE_API_KEY ?? '';
const SEARCH_ENGINE_ID = process.env.GOOGLE_CSE_ID ?? '';
const MAX_RETRIES = 3;

// Validate environment variables
const validateEnv = (): void => {
  if (!API_KEY || !SEARCH_ENGINE_ID) {
    throw new Error('GOOGLE_API_KEY and GOOGLE_CSE_ID must be set in environment variables');
  }
};

// Convert product name to filename (e.g., "Fanta Orange 500ml" -> "fanta-orange-500ml")
const convertToFileName = (productName: string): string => {
  return productName
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ''); // Remove special characters
};

// Ensure the products directory exists
const ensureProductsDirectory = async (): Promise<void> => {
  const dirPath = path.join(process.cwd(), PRODUCTS_DIR);
  await fs.mkdir(dirPath, { recursive: true });
};

// Fetch image URL from Google Custom Search API
const fetchProductImageUrl = async (productName: string, retryCount = 0): Promise<string> => {
  validateEnv();
  try {
    const response = await axios.get<GoogleSearchResponse>(GOOGLE_API_BASE_URL, {
      params: {
        key: API_KEY,
        cx: SEARCH_ENGINE_ID,
        q: productName,
        searchType: 'image',
        imgType: 'photo',
        num: 1, // Get only the first image
      },
    });

    const imageUrl = response.data.items[0]?.link;
    if (!imageUrl) {
      throw new Error(`No image found for product: ${productName}`);
    }
    return imageUrl;
  } catch (error) {
    const errorMessage = error instanceof AxiosError ? error.message : String(error);
    if (retryCount < MAX_RETRIES) {
      console.warn(`Retrying for ${productName}, attempt ${retryCount + 1}`);
      return fetchProductImageUrl(productName, retryCount + 1);
    }
    throw new Error(`Failed to fetch image for ${productName}: ${errorMessage}`);
  }
};

// Download and save image to products directory
const downloadAndSaveImage = async ({ url, productName }: ProductImage): Promise<void> => {
  const fileName = convertToFileName(productName);
  const filePath = path.join(process.cwd(), PRODUCTS_DIR, `${fileName}.jpg`);

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    await fs.writeFile(filePath, response.data);
    console.log(`Successfully downloaded image for ${productName} to ${filePath}`);
  } catch (error) {
    const errorMessage = error instanceof AxiosError ? error.message : String(error);
    throw new Error(`Failed to download/save image for ${productName}: ${errorMessage}`);
  }
};

// Main function to process product image downloads
export const downloadProductImages = async (productNames: readonly string[]): Promise<void> => {
  await ensureProductsDirectory();

  const downloadPromises = productNames.map(async (productName) => {
    try {
      const imageUrl = await fetchProductImageUrl(productName);
      await downloadAndSaveImage({ url: imageUrl, productName });
    } catch (error) {
      const errorMessage = error instanceof AxiosError ? error.message : String(error);
      console.error(`Error downloading image for ${productName}: ${errorMessage}`);
    }
  });

  await Promise.all(downloadPromises);
};
