import * as fs from 'fs';
import { Product, PRODUCTS, PRODUCT_CATEGORIES } from './products';

// Function to convert a product to CSV row
const productToCSV = (product: Product): string => {
    return `${product.id},${product.name},${product.wholesalePrice},${product.category},${product.description},${product.image},${product.stock},${product.unit},${product.brand || ''},${product.size || ''},${product.price || ''},${product.wholesaleQuantity || ''}`;
};

// Function to group products by category and save to CSV files
const generateCategoryCSVs = () => {
    // Object to store products grouped by category
    const categories: Record<string, Product[]> = {};

    // Group products by category
    PRODUCTS.forEach(product => {
        if (!categories[product.category]) {
            categories[product.category] = [];
        }
        categories[product.category].push(product);
    });

    // Generate CSV file for each category
    Object.entries(categories).forEach(([category, products]) => {
        // Convert category name to lowercase and replace spaces/special chars for filename
        const fileName = category.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.csv';
        
        // Create CSV content with header
        const header = 'id,name,wholesalePrice,category,description,image,stock,unit,brand,size,price,wholesaleQuantity\n';
        const csvContent = header + products.map(productToCSV).join('\n');

        // Write to file
        try {
            fs.writeFileSync(fileName, csvContent);
            console.log(`Successfully created ${fileName} with ${products.length} products`);
        } catch (error) {
            console.error(`Error writing ${fileName}:`, error);
        }
    });
};

// Execute the function
generateCategoryCSVs();