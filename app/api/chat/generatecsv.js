const fs = require('fs').promises;
const path = require('path');

// Import products and categories from products.ts
const { PRODUCTS, PRODUCT_CATEGORIES } = require('../../../data/products');

// Function to convert products to CSV format
function productsToCSV(products) {
  const headers = ['id', 'name', 'wholesalePrice', 'category', 'description', 'image', 'stock', 'unit', 'brand', 'size', 'price', 'wholesaleQuantity'];
  const rows = products.map(product => 
    headers.map(header => {
      const value = product[header] ?? '';
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

// Main function to generate CSV files
async function generateCategoryCSVs() {
  try {
    const outputDir = path.join(__dirname, './data');
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Get all unique categories
    const categories = Object.values(PRODUCT_CATEGORIES);

    // Generate CSV file for each category
    for (const category of categories) {
      // Filter products by category
      const categoryProducts = PRODUCTS.filter(product => product.category === category);
      
      if (categoryProducts.length > 0) {
        // Convert category name to safe filename (lowercase, replace spaces with hyphens)
        const fileName = category.toLowerCase().replace(/[\s&\/\\#,+()$~%.'":*?<>{}]/g, '-') + '.csv';
        const filePath = path.join(outputDir, fileName);
        
        // Generate CSV content
        const csvContent = productsToCSV(categoryProducts);
        
        // Write CSV file
        await fs.writeFile(filePath, csvContent);
        console.log(`Generated CSV file for ${category}: ${filePath}`);
      }
    }
    
    console.log('All category CSV files generated successfully');
  } catch (error) {
    console.error('Error generating CSV files:', error);
  }
}

// Run the script
generateCategoryCSVs();