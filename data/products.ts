// Product Categories and Data Management
export interface Product {
  id: number
  name: string
  price: number
  category: string
  description: string
  image: string
  stock: number
  unit: string
  brand?: string
  size?: string
}

export const PRODUCT_CATEGORIES = {
  COOKING_OILS: "Cooking Oils & Fats",
  RICE_GRAINS: "Rice & Grains",
  SUGAR_SWEETENERS: "Sugar & Sweeteners",
  FLOUR: "Flour",
  BEVERAGES: "Beverages",
  DAIRY: "Dairy Products",
  PERSONAL_CARE: "Personal Care & Hygiene",
  CLEANING: "Cleaning Products",
  BABY_CARE: "Baby Care",
  SNACKS: "Snacks & Confectionery",
  CANNED_FOODS: "Canned Foods",
  CEREALS_LEGUMES: "Cereals & Legumes",
  HOUSEHOLD: "Household Items",
  HEALTH: "Health & Medicine",
} as const

// All Products Database
export const PRODUCTS: Product[] = [
  // COOKING OILS & FATS
  {
    id: 1,
    name: "RINA Cooking Oil",
    price: 205, // (4000/20) + 5
    category: PRODUCT_CATEGORIES.COOKING_OILS,
    description: "Premium quality cooking oil - 1 Litre",
    image: "/images/products/rina-cooking-oil-1l.jpg",
    stock: 100,
    unit: "1L",
    brand: "RINA",
    size: "1 Litre",
  },
  {
    id: 2,
    name: "RINA Cooking Oil",
    price: 105, // (2000/20) + 5
    category: PRODUCT_CATEGORIES.COOKING_OILS,
    description: "Premium quality cooking oil - 500ml",
    image: "/images/products/rina-cooking-oil-500ml.jpg",
    stock: 150,
    unit: "500ml",
    brand: "RINA",
    size: "500ml",
  },
  {
    id: 3,
    name: "SALIT Cooking Oil",
    price: 205, // (4000/20) + 5
    category: PRODUCT_CATEGORIES.COOKING_OILS,
    description: "Quality cooking oil - 1 Litre",
    image: "/images/products/salit-cooking-oil-1l.jpg",
    stock: 80,
    unit: "1L",
    brand: "SALIT",
    size: "1 Litre",
  },
  {
    id: 4,
    name: "BAHARI Cooking Oil",
    price: 105, // (2000/20) + 5
    category: PRODUCT_CATEGORIES.COOKING_OILS,
    description: "Quality cooking oil - 500ml",
    image: "/images/products/bahari-cooking-oil-500ml.jpg",
    stock: 120,
    unit: "500ml",
    brand: "BAHARI",
    size: "500ml",
  },
  {
    id: 5,
    name: "RINSUN Sunflower Oil",
    price: 4205, // 4200 + 5 (this is the actual price for the 20L container)
    category: PRODUCT_CATEGORIES.COOKING_OILS,
    description: "Pure sunflower vegetable oil - 20 Litres",
    image: "/images/products/rinsun-sunflower-oil-20l.jpg",
    stock: 25,
    unit: "20L",
    brand: "RINSUN",
    size: "20 Litres",
  },
  {
    id: 6,
    name: "SOMO Solid Cooking Fat",
    price: 1255, // 1250 + 5 (this is the actual price for the 10kg carton)
    category: PRODUCT_CATEGORIES.COOKING_OILS,
    description: "Solid cooking fat - 10kgs carton",
    image: "/images/products/somo-cooking-fat-10kg.jpg",
    stock: 30,
    unit: "10kg",
    brand: "SOMO",
    size: "10 Kilograms",
  },
  {
    id: 7,
    name: "FRY MATE Cooking Fat",
    price: 1255, // 1250 + 5 (this is the actual price for the 10kg carton)
    category: PRODUCT_CATEGORIES.COOKING_OILS,
    description: "Premium cooking fat - 10kgs carton",
    image: "/images/products/frymate-cooking-fat-10kg.jpg",
    stock: 35,
    unit: "10kg",
    brand: "FRY MATE",
    size: "10 Kilograms",
  },

  // RICE & GRAINS
  {
    id: 8,
    name: "BIRIYANI Rice",
    price: 2105, // 2100 + 5 (this is the actual price for the 25kg bag)
    category: PRODUCT_CATEGORIES.RICE_GRAINS,
    description: "Premium Biriyani rice - 25kgs",
    image: "/images/products/biriyani-rice-25kg.jpg",
    stock: 20,
    unit: "25kg",
    size: "25 Kilograms",
  },
  {
    id: 9,
    name: "BASMATI Rice",
    price: 2805, // 2800 + 5 (this is the actual price for the 25kg bag)
    category: PRODUCT_CATEGORIES.RICE_GRAINS,
    description: "Premium Basmati rice - 25kgs",
    image: "/images/products/basmati-rice-25kg.jpg",
    stock: 15,
    unit: "25kg",
    size: "25 Kilograms",
  },
  {
    id: 10,
    name: "PISHORI Rice",
    price: 4005, // 4000 + 5 (this is the actual price for the 25kg bag)
    category: PRODUCT_CATEGORIES.RICE_GRAINS,
    description: "Premium Pishori rice - 25kgs",
    image: "/images/products/pishori-rice-25kg.jpg",
    stock: 12,
    unit: "25kg",
    size: "25 Kilograms",
  },
  {
    id: 11,
    name: "SINDANO Rice",
    price: 2005, // 2000 + 5 (this is the actual price for the 25kg bag)
    category: PRODUCT_CATEGORIES.RICE_GRAINS,
    description: "Quality Sindano rice - 25kgs",
    image: "/images/products/sindano-rice-25kg.jpg",
    stock: 18,
    unit: "25kg",
    size: "25 Kilograms",
  },

  // SUGAR & SWEETENERS
  {
    id: 12,
    name: "Brown Sugar",
    price: 6405, // 6400 + 5
    category: PRODUCT_CATEGORIES.SUGAR_SWEETENERS,
    description: "Pure brown sugar - 50kgs",
    image: "/images/products/brown-sugar-50kg.jpg",
    stock: 10,
    unit: "50kg",
    size: "50 Kilograms",
  },
  {
    id: 13,
    name: "White Sugar",
    price: 6505, // 6500 + 5
    category: PRODUCT_CATEGORIES.SUGAR_SWEETENERS,
    description: "Pure white sugar - 50kgs",
    image: "/images/products/white-sugar-50kg.jpg",
    stock: 8,
    unit: "50kg",
    size: "50 Kilograms",
  },

  // FLOUR
  {
    id: 14,
    name: "AJAB Wheat Flour",
    price: 77, // (1800/24) + 5 = 75 + 5
    category: PRODUCT_CATEGORIES.FLOUR,
    description: "Premium wheat flour - 2kg pack",
    image: "/images/products/ajab-wheat-flour-2kg.jpg",
    stock: 200,
    unit: "2kg",
    brand: "AJAB",
    size: "2 Kilograms",
  },
  {
    id: 15,
    name: "PEMBE Wheat Flour",
    price: 78, // (1750/24) + 5 = 73 + 5
    category: PRODUCT_CATEGORIES.FLOUR,
    description: "Quality wheat flour - 1kg pack",
    image: "/images/products/pembe-wheat-flour-1kg.jpg",
    stock: 250,
    unit: "1kg",
    brand: "PEMBE",
    size: "1 Kilogram",
  },
  {
    id: 16,
    name: "DOLA Maize Flour",
    price: 72, // (1600/24) + 5 = 67 + 5
    category: PRODUCT_CATEGORIES.FLOUR,
    description: "Pure maize flour - 2kg pack",
    image: "/images/products/dola-maize-flour-2kg.jpg",
    stock: 180,
    unit: "2kg",
    brand: "DOLA",
    size: "2 Kilograms",
  },
  {
    id: 17,
    name: "NDOVU Maize Flour",
    price: 70, // (1550/24) + 5 = 65 + 5
    category: PRODUCT_CATEGORIES.FLOUR,
    description: "Quality maize flour - 1kg pack",
    image: "/images/products/ndovu-maize-flour-1kg.jpg",
    stock: 220,
    unit: "1kg",
    brand: "NDOVU",
    size: "1 Kilogram",
  },

  // BEVERAGES
  {
    id: 18,
    name: "RED BULL Energy Drink",
    price: 105, // (2400/24) + 5
    category: PRODUCT_CATEGORIES.BEVERAGES,
    description: "Premium energy drink - 250ml can",
    image: "/images/products/red-bull-250ml.jpg",
    stock: 300,
    unit: "250ml",
    brand: "RED BULL",
    size: "250ml",
  },
  {
    id: 19,
    name: "AZAM Energy Drink",
    price: 41, // (860/24) + 5 = 36 + 5
    category: PRODUCT_CATEGORIES.BEVERAGES,
    description: "Energy drink - 300ml bottle",
    image: "/images/products/azam-energy-300ml.jpg",
    stock: 200,
    unit: "300ml",
    brand: "AZAM",
    size: "300ml",
  },
  {
    id: 20,
    name: "PREDATOR Energy Drink",
    price: 45, // (480/12) + 5
    category: PRODUCT_CATEGORIES.BEVERAGES,
    description: "Energy drink - 500ml bottle",
    image: "/images/products/predator-energy-500ml.jpg",
    stock: 150,
    unit: "500ml",
    brand: "PREDATOR",
    size: "500ml",
  },
  {
    id: 21,
    name: "POWER PLAY Energy Drink",
    price: 47, // (500/12) + 5 = 42 + 5
    category: PRODUCT_CATEGORIES.BEVERAGES,
    description: "Energy drink - 500ml bottle",
    image: "/images/products/powerplay-energy-500ml.jpg",
    stock: 120,
    unit: "500ml",
    brand: "POWER PLAY",
    size: "500ml",
  },

  // DAIRY PRODUCTS
  {
    id: 22,
    name: "Milk Powder",
    price: 7805, // 7800 + 5
    category: PRODUCT_CATEGORIES.DAIRY,
    description: "Pure milk powder - 25kg pack",
    image: "/images/products/milk-powder-25kg.jpg",
    stock: 15,
    unit: "25kg",
    size: "25 Kilograms",
  },
  {
    id: 23,
    name: "Lato UHT Whole Milk",
    price: 48, // (520/12) + 5 = 43 + 5
    category: PRODUCT_CATEGORIES.DAIRY,
    description: "Fresh whole milk - 500ml pack",
    image: "/images/products/lato-milk-500ml.jpg",
    stock: 100,
    unit: "500ml",
    brand: "Lato",
    size: "500ml",
  },
  {
    id: 24,
    name: "Lato Pure Ghee",
    price: 405, // (4800/12) + 5
    category: PRODUCT_CATEGORIES.DAIRY,
    description: "Pure ghee - 1kg container",
    image: "/images/products/lato-ghee-1kg.jpg",
    stock: 50,
    unit: "1kg",
    brand: "Lato",
    size: "1 Kilogram",
  },
  {
    id: 25,
    name: "Lato Butter",
    price: 495, // (5880/12) + 5
    category: PRODUCT_CATEGORIES.DAIRY,
    description: "Fresh butter - 500g pack",
    image: "/images/products/lato-butter-500g.jpg",
    stock: 60,
    unit: "500g",
    brand: "Lato",
    size: "500 Grams",
  },
  {
    id: 26,
    name: "Cheese",
    price: 305, // (3600/12) + 5
    category: PRODUCT_CATEGORIES.DAIRY,
    description: "Premium cheese - 250g pack",
    image: "/images/products/cheese-250g.jpg",
    stock: 80,
    unit: "250g",
    size: "250 Grams",
  },

  // PERSONAL CARE & HYGIENE
  {
    id: 27,
    name: "MENENGAI Bar Soap",
    price: 125, // (3000/25) + 5 = 120 + 5
    category: PRODUCT_CATEGORIES.PERSONAL_CARE,
    description: "Quality bar soap - 1kg",
    image: "/images/products/menengai-soap-1kg.jpg",
    stock: 200,
    unit: "1kg",
    brand: "MENENGAI",
    size: "1 Kilogram",
  },
  {
    id: 28,
    name: "MSAFI Bar Soap",
    price: 120, // (1150/10) + 5 = 115 + 5
    category: PRODUCT_CATEGORIES.PERSONAL_CARE,
    description: "Premium bar soap - 1kg",
    image: "/images/products/msafi-soap-1kg.jpg",
    stock: 150,
    unit: "1kg",
    brand: "MSAFI",
    size: "1 Kilogram",
  },
  {
    id: 29,
    name: "BIDCO Cream Bar Soap",
    price: 97, // (2300/25) + 5 = 92 + 5
    category: PRODUCT_CATEGORIES.PERSONAL_CARE,
    description: "Cream bar soap - 800g",
    image: "/images/products/bidco-cream-soap-800g.jpg",
    stock: 180,
    unit: "800g",
    brand: "BIDCO",
    size: "800 Grams",
  },

  // CLEANING PRODUCTS
  {
    id: 30,
    name: "Livelle Toilet Tissue",
    price: 40, // (1500/40) + 5 = 37.5 + 5
    category: PRODUCT_CATEGORIES.CLEANING,
    description: "Soft toilet tissue - 4 rolls",
    image: "/images/products/livelle-toilet-tissue-4rolls.jpg",
    stock: 100,
    unit: "4 rolls",
    brand: "Livelle",
    size: "4 Rolls",
  },
  {
    id: 31,
    name: "Poshy Roll Toilet Tissue",
    price: 27, // (1000/40) + 5 = 25 + 5
    category: PRODUCT_CATEGORIES.CLEANING,
    description: "Extra toilet tissue - 4 rolls",
    image: "/images/products/poshy-toilet-tissue-4rolls.jpg",
    stock: 120,
    unit: "4 rolls",
    brand: "Poshy",
    size: "4 Rolls",
  },
  {
    id: 32,
    name: "Nuru Scouring Powder",
    price: 55, // (1200/24) + 5 = 50 + 5
    category: PRODUCT_CATEGORIES.CLEANING,
    description: "Lemon fresh scouring powder - 500g",
    image: "/images/products/nuru-scouring-powder-500g.jpg",
    stock: 80,
    unit: "500g",
    brand: "Nuru",
    size: "500 Grams",
  },
  {
    id: 33,
    name: "Sunlight Washing Powder",
    price: 122, // (2800/24) + 5 = 117 + 5
    category: PRODUCT_CATEGORIES.CLEANING,
    description: "Premium washing powder - 500g",
    image: "/images/products/sunlight-washing-powder-500g.jpg",
    stock: 90,
    unit: "500g",
    brand: "Sunlight",
    size: "500 Grams",
  },
  {
    id: 34,
    name: "Jik Bleach Regular",
    price: 755, // (3000/4) + 5
    category: PRODUCT_CATEGORIES.CLEANING,
    description: "Regular bleach - 1.5L bottle",
    image: "/images/products/jik-bleach-regular-1.5l.jpg",
    stock: 60,
    unit: "1.5L",
    brand: "Jik",
    size: "1.5 Litres",
  },
  {
    id: 35,
    name: "Harpic Power Plus",
    price: 1047, // (12500/12) + 5 = 1042 + 5
    category: PRODUCT_CATEGORIES.CLEANING,
    description: "Toilet cleaner - 1L bottle",
    image: "/images/products/harpic-power-plus-1l.jpg",
    stock: 40,
    unit: "1L",
    brand: "Harpic",
    size: "1 Litre",
  },

  // BABY CARE
  {
    id: 36,
    name: "Softcare Gold Baby Diapers Small",
    price: 555, // 550 + 5
    category: PRODUCT_CATEGORIES.BABY_CARE,
    description: "Premium baby diapers - Small (3-6kg) 48 pieces",
    image: "/images/products/softcare-diapers-small-48pcs.jpg",
    stock: 50,
    unit: "48 pcs",
    brand: "Softcare",
    size: "Small (3-6kg)",
  },
  {
    id: 37,
    name: "Softcare Gold Baby Diapers Medium",
    price: 555, // 550 + 5
    category: PRODUCT_CATEGORIES.BABY_CARE,
    description: "Premium baby diapers - Medium (6.1-9kg) 42 pieces",
    image: "/images/products/softcare-diapers-medium-42pcs.jpg",
    stock: 45,
    unit: "42 pcs",
    brand: "Softcare",
    size: "Medium (6.1-9kg)",
  },
  {
    id: 38,
    name: "Cuettie Baby Diapers Small",
    price: 505, // 500 + 5
    category: PRODUCT_CATEGORIES.BABY_CARE,
    description: "Quality baby diapers - Small (3-6kg) 48 pieces",
    image: "/images/products/cuettie-diapers-small-48pcs.jpg",
    stock: 60,
    unit: "48 pcs",
    brand: "Cuettie",
    size: "Small (3-6kg)",
  },
  {
    id: 39,
    name: "Sunny Adult Diapers Medium",
    price: 755, // 750 + 5
    category: PRODUCT_CATEGORIES.BABY_CARE,
    description: "Adult diapers - Medium size, 10 pieces",
    image: "/images/products/sunny-adult-diapers-medium-10pcs.jpg",
    stock: 30,
    unit: "10 pcs",
    brand: "Sunny",
    size: "Medium",
  },

  // SNACKS & CONFECTIONERY
  {
    id: 40,
    name: "Krackles Potato Crisps",
    price: 51, // (2200/48) + 5 = 46 + 5
    category: PRODUCT_CATEGORIES.SNACKS,
    description: "Assorted potato crisps - 30g pack",
    image: "/images/products/krackles-crisps-30g.jpg",
    stock: 200,
    unit: "30g",
    brand: "Krackles",
    size: "30 Grams",
  },
  {
    id: 41,
    name: "M&M's Chocolate",
    price: 605, // (1800/3) + 5
    category: PRODUCT_CATEGORIES.SNACKS,
    description: "Chocolate candies - 200g pack",
    image: "/images/products/mms-chocolate-200g.jpg",
    stock: 80,
    unit: "200g",
    brand: "M&M's",
    size: "200 Grams",
  },
  {
    id: 42,
    name: "Haribo Happy Cherries",
    price: 172, // (2500/15) + 5 = 167 + 5
    category: PRODUCT_CATEGORIES.SNACKS,
    description: "Gummy cherries - 80g pack",
    image: "/images/products/haribo-cherries-80g.jpg",
    stock: 100,
    unit: "80g",
    brand: "Haribo",
    size: "80 Grams",
  },
  {
    id: 43,
    name: "Nestle KitKat White",
    price: 172, // (4000/24) + 5 = 167 + 5
    category: PRODUCT_CATEGORIES.SNACKS,
    description: "White chocolate KitKat - 41.5g",
    image: "/images/products/kitkat-white-41.5g.jpg",
    stock: 150,
    unit: "41.5g",
    brand: "Nestle",
    size: "41.5 Grams",
  },

  // CANNED FOODS
  {
    id: 44,
    name: "Domee Peach Halves",
    price: 255, // (3000/12) + 5
    category: PRODUCT_CATEGORIES.CANNED_FOODS,
    description: "Peach halves in syrup - 425g can",
    image: "/images/products/domee-peach-425g.jpg",
    stock: 70,
    unit: "425g",
    brand: "Domee",
    size: "425 Grams",
  },
  {
    id: 45,
    name: "Domee Lychees",
    price: 422, // (2500/6) + 5 = 417 + 5
    category: PRODUCT_CATEGORIES.CANNED_FOODS,
    description: "Lychees in syrup - 567g can",
    image: "/images/products/domee-lychees-567g.jpg",
    stock: 40,
    unit: "567g",
    brand: "Domee",
    size: "567 Grams",
  },

  // CEREALS & LEGUMES
  {
    id: 46,
    name: "Makueni Ndengu",
    price: 7505, // 7500 + 5
    category: PRODUCT_CATEGORIES.CEREALS_LEGUMES,
    description: "Premium green grams - 90kg sack",
    image: "/images/products/makueni-ndengu-90kg.jpg",
    stock: 8,
    unit: "90kg",
    size: "90 Kilograms",
  },
  {
    id: 47,
    name: "Nylon Ndengu",
    price: 6505, // 6500 + 5
    category: PRODUCT_CATEGORIES.CEREALS_LEGUMES,
    description: "Quality green grams - 90kg sack",
    image: "/images/products/nylon-ndengu-90kg.jpg",
    stock: 10,
    unit: "90kg",
    size: "90 Kilograms",
  },
  {
    id: 48,
    name: "Kamande Beans",
    price: 5505, // 5500 + 5
    category: PRODUCT_CATEGORIES.CEREALS_LEGUMES,
    description: "Premium beans - 50kg sack",
    image: "/images/products/kamande-beans-50kg.jpg",
    stock: 12,
    unit: "50kg",
    size: "50 Kilograms",
  },

  // HOUSEHOLD ITEMS
  {
    id: 49,
    name: "Eggs Crate",
    price: 385, // 380 + 5
    category: PRODUCT_CATEGORIES.HOUSEHOLD,
    description: "Fresh eggs - 30 pieces crate",
    image: "/images/products/eggs-crate-30pcs.jpg",
    stock: 50,
    unit: "30 pcs",
    size: "30 Pieces",
  },
  {
    id: 50,
    name: "Daawat Spaghetti",
    price: 39, // (820/24) + 5 = 34 + 5
    category: PRODUCT_CATEGORIES.HOUSEHOLD,
    description: "Premium spaghetti - 400g pack",
    image: "/images/products/daawat-spaghetti-400g.jpg",
    stock: 100,
    unit: "400g",
    brand: "Daawat",
    size: "400 Grams",
  },
]

// Helper functions for product management
export const getProductsByCategory = (category: string): Product[] => {
  return PRODUCTS.filter((product) => product.category === category)
}

export const getProductById = (id: number): Product | undefined => {
  return PRODUCTS.find((product) => product.id === id)
}

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase()
  return PRODUCTS.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.brand?.toLowerCase().includes(lowercaseQuery),
  )
}

export const getAvailableProducts = (): Product[] => {
  return PRODUCTS.filter((product) => product.stock > 0)
}

export const getCategoriesWithCounts = () => {
  const categoryCounts: Record<string, number> = {}

  PRODUCTS.forEach((product) => {
    categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1
  })

  return Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count,
    products: getProductsByCategory(category),
  }))
}
