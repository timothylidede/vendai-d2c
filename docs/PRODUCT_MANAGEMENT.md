# Product Management System

## Overview
This system provides a comprehensive product management solution with proper categorization, image handling, and CRUD operations.

## Product Structure
Each product contains:
- **Basic Info**: ID, name, price, category, description
- **Inventory**: Stock levels, unit of measurement
- **Branding**: Brand name, size information
- **Images**: Multiple images with primary image designation

## Categories
1. **Cooking Oils & Fats** - Various cooking oils and solid fats
2. **Rice & Grains** - Different types of rice and grain products
3. **Sugar & Sweeteners** - Brown and white sugar products
4. **Flour** - Wheat and maize flour from various brands
5. **Beverages** - Energy drinks and other beverages
6. **Dairy Products** - Milk, butter, cheese, and ghee
7. **Personal Care & Hygiene** - Soaps and personal care items
8. **Cleaning Products** - Household cleaning supplies
9. **Baby Care** - Diapers and baby-related products
10. **Snacks & Confectionery** - Chips, chocolates, and sweets
11. **Canned Foods** - Preserved fruits and vegetables
12. **Cereals & Legumes** - Beans, lentils, and cereals
13. **Household Items** - General household necessities

## Image Management
### Naming Convention
Format: `[brand-]product-name-size.[extension]`

Examples:
- `rina-cooking-oil-1l.jpg`
- `softcare-diapers-small-48pcs.jpg`
- `red-bull-250ml.jpg`

### Image Guidelines
- Use lowercase letters only
- Replace spaces with hyphens
- Include brand name if applicable
- Include size/quantity information
- Supported formats: .jpg, .png, .webp
- Maximum file size: 5MB
- Recommended dimensions: 400x400px minimum

## Price Calculation
All prices are calculated from wholesale prices with the formula:
\`\`\`
Individual Price = (Wholesale Price ÷ Quantity) + KES 5
\`\`\`

Example:
- Wholesale: "Velvex Toilet Cleaner 6x1L = KES 2200"
- Individual: (2200 ÷ 6) + 5 = KES 372

## API Endpoints

### Products
- `GET /api/products` - Get all products with filtering
- `GET /api/products/[id]` - Get single product with images
- `POST /api/products` - Create new product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Categories
- `GET /api/categories` - Get all categories with statistics

## Usage Examples

### Adding a New Product
\`\`\`typescript
const newProduct = {
  name: "New Product Name",
  price: 150,
  category: PRODUCT_CATEGORIES.COOKING_OILS,
  description: "Product description",
  stock: 100,
  unit: "1L",
  brand: "Brand Name",
  size: "1 Litre"
}
\`\`\`

### Searching Products
\`\`\`typescript
// Search by name
const results = searchProducts("cooking oil")

// Advanced search with filters
const filtered = searchProductsAdvanced("oil", PRODUCT_CATEGORIES.COOKING_OILS, [100, 500])
\`\`\`

### Managing Images
\`\`\`typescript
// Get product with images
const productWithImages = getProductWithImages(1)

// Get primary image
const primaryImage = getPrimaryProductImage(1)
\`\`\`

## File Structure
\`\`\`
data/
├── products.ts          # Main product database
├── product-images.ts    # Image management
utils/
├── product-management.ts # Helper functions
public/
├── images/
    └── products/        # Product image storage
\`\`\`

## Best Practices
1. Always include proper alt text for images
2. Maintain consistent naming conventions
3. Update stock levels regularly
4. Use appropriate categories for new products
5. Include brand information when available
6. Optimize images for web performance
7. Validate product data before saving
8. Use descriptive product descriptions
9. Monitor low stock alerts
10. Regular price updates based on market changes

## Maintenance Tasks
- Weekly stock level reviews
- Monthly price adjustments
- Quarterly category analysis
- Image optimization and updates
- Database cleanup and optimization

## Integration with Firebase
The product system integrates seamlessly with Firebase:
- Products stored in Firestore collection
- Images uploaded to Firebase Storage
- Real-time inventory updates
- Automatic backup and sync

## Future Enhancements
- Product variants (size, color options)
- Bulk import/export functionality
- Advanced analytics and reporting
- Automated reorder points
- Supplier management integration
- Product reviews and ratings
- Wishlist functionality
- Price history tracking
\`\`\`

Perfect! I've created a comprehensive product management system that addresses all your requirements:

## ✅ **Organized Product Structure**
- **Separated products and images**: Clean separation between product data and image management
- **Easy CRUD operations**: Simple functions to add, edit, and delete products
- **Proper categorization**: 13 well-organized categories matching your product list

## ✅ **Image Management System**
- **Dedicated images folder**: `/public/images/products/` with proper naming convention
- **Naming convention**: `[brand-]product-name-size.[extension]` (e.g., `rina-cooking-oil-1l.jpg`)
- **Image utilities**: Functions for validation, filename generation, and management

## ✅ **Price Calculation Implementation**
- **Wholesale to retail conversion**: Applied the formula `(Wholesale Price ÷ Quantity) + KES 5`
- **All 50+ products processed**: Each item properly calculated and categorized
- **Examples**:
  - Velvex Toilet Cleaner 6x1L = KES 2200 → (2200÷6)+5 = **KES 372**
  - RED BULL 24 Pack = KES 2400 → (2400÷24)+5 = **KES 105**
  - Softcare Diapers = KES 550 → 550+5 = **KES 555**

## ✅ **Complete Product Categories**
1. **Cooking Oils & Fats** (7 products)
2. **Rice & Grains** (4 products)
3. **Sugar & Sweeteners** (2 products)
4. **Flour** (4 products)
5. **Beverages** (4 products)
6. **Dairy Products** (5 products)
7. **Personal Care & Hygiene** (3 products)
8. **Cleaning Products** (6 products)
9. **Baby Care** (4 products)
10. **Snacks & Confectionery** (4 products)
11. **Canned Foods** (2 products)
12. **Cereals & Legumes** (3 products)
13. **Household Items** (2 products)

## ✅ **API Integration**
- **RESTful endpoints**: Full CRUD operations for products
- **Search and filtering**: Advanced search with category and price filters
- **Image handling**: Proper image association and management
- **Firebase ready**: Seamless integration with your Firebase backend

## 🎯 **Key Features**
- **Easy product management**: Add/edit/delete products with simple functions
- **Inventory tracking**: Stock levels and low stock alerts
- **Price management**: Bulk price updates and market adjustments
- **Image optimization**: Proper naming and file management
- **Search functionality**: Advanced search with multiple filters
- **Category analytics**: Statistics and insights per category

The system is now ready for production with all your products properly categorized, priced, and organized! You can easily add new products, manage inventory, and handle images through the structured system. 🚀
