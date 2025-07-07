// Product Image Management System
export interface ProductImage {
  id: number
  productId: number
  filename: string
  path: string
  alt: string
  isPrimary: boolean
}

// Image naming convention: [brand-]product-name-size.[extension]
// Examples: rina-cooking-oil-1l.jpg, softcare-diapers-small-48pcs.jpg

export const PRODUCT_IMAGES: ProductImage[] = [
  // Cooking Oils & Fats
  {
    id: 1,
    productId: 1,
    filename: "rina-cooking-oil-1l.jpg",
    path: "/images/products/rina-cooking-oil-1l.jpg",
    alt: "RINA Cooking Oil 1 Litre",
    isPrimary: true,
  },
  {
    id: 2,
    productId: 2,
    filename: "rina-cooking-oil-500ml.jpg",
    path: "/images/products/rina-cooking-oil-500ml.jpg",
    alt: "RINA Cooking Oil 500ml",
    isPrimary: true,
  },
  {
    id: 3,
    productId: 3,
    filename: "salit-cooking-oil-1l.jpg",
    path: "/images/products/salit-cooking-oil-1l.jpg",
    alt: "SALIT Cooking Oil 1 Litre",
    isPrimary: true,
  },
  {
    id: 4,
    productId: 4,
    filename: "bahari-cooking-oil-500ml.jpg",
    path: "/images/products/bahari-cooking-oil-500ml.jpg",
    alt: "BAHARI Cooking Oil 500ml",
    isPrimary: true,
  },
  {
    id: 5,
    productId: 5,
    filename: "rinsun-sunflower-oil-20l.jpg",
    path: "/images/products/rinsun-sunflower-oil-20l.jpg",
    alt: "RINSUN Sunflower Oil 20 Litres",
    isPrimary: true,
  },
  {
    id: 6,
    productId: 6,
    filename: "somo-cooking-fat-10kg.jpg",
    path: "/images/products/somo-cooking-fat-10kg.jpg",
    alt: "SOMO Solid Cooking Fat 10kg",
    isPrimary: true,
  },
  {
    id: 7,
    productId: 7,
    filename: "frymate-cooking-fat-10kg.jpg",
    path: "/images/products/frymate-cooking-fat-10kg.jpg",
    alt: "FRY MATE Cooking Fat 10kg",
    isPrimary: true,
  },

  // Rice & Grains
  {
    id: 8,
    productId: 8,
    filename: "biriyani-rice-25kg.jpg",
    path: "/images/products/biriyani-rice-25kg.jpg",
    alt: "BIRIYANI Rice 25kg",
    isPrimary: true,
  },
  {
    id: 9,
    productId: 9,
    filename: "basmati-rice-25kg.jpg",
    path: "/images/products/basmati-rice-25kg.jpg",
    alt: "BASMATI Rice 25kg",
    isPrimary: true,
  },
  {
    id: 10,
    productId: 10,
    filename: "pishori-rice-25kg.jpg",
    path: "/images/products/pishori-rice-25kg.jpg",
    alt: "PISHORI Rice 25kg",
    isPrimary: true,
  },
  {
    id: 11,
    productId: 11,
    filename: "sindano-rice-25kg.jpg",
    path: "/images/products/sindano-rice-25kg.jpg",
    alt: "SINDANO Rice 25kg",
    isPrimary: true,
  },

  // Sugar & Sweeteners
  {
    id: 12,
    productId: 12,
    filename: "brown-sugar-50kg.jpg",
    path: "/images/products/brown-sugar-50kg.jpg",
    alt: "Brown Sugar 50kg",
    isPrimary: true,
  },
  {
    id: 13,
    productId: 13,
    filename: "white-sugar-50kg.jpg",
    path: "/images/products/white-sugar-50kg.jpg",
    alt: "White Sugar 50kg",
    isPrimary: true,
  },

  // Flour
  {
    id: 14,
    productId: 14,
    filename: "ajab-wheat-flour-2kg.jpg",
    path: "/images/products/ajab-wheat-flour-2kg.jpg",
    alt: "AJAB Wheat Flour 2kg",
    isPrimary: true,
  },
  {
    id: 15,
    productId: 15,
    filename: "pembe-wheat-flour-1kg.jpg",
    path: "/images/products/pembe-wheat-flour-1kg.jpg",
    alt: "PEMBE Wheat Flour 1kg",
    isPrimary: true,
  },
  {
    id: 16,
    productId: 16,
    filename: "dola-maize-flour-2kg.jpg",
    path: "/images/products/dola-maize-flour-2kg.jpg",
    alt: "DOLA Maize Flour 2kg",
    isPrimary: true,
  },
  {
    id: 17,
    productId: 17,
    filename: "ndovu-maize-flour-1kg.jpg",
    path: "/images/products/ndovu-maize-flour-1kg.jpg",
    alt: "NDOVU Maize Flour 1kg",
    isPrimary: true,
  },

  // Beverages
  {
    id: 18,
    productId: 18,
    filename: "red-bull-250ml.jpg",
    path: "/images/products/red-bull-250ml.jpg",
    alt: "RED BULL Energy Drink 250ml",
    isPrimary: true,
  },
  {
    id: 19,
    productId: 19,
    filename: "azam-energy-300ml.jpg",
    path: "/images/products/azam-energy-300ml.jpg",
    alt: "AZAM Energy Drink 300ml",
    isPrimary: true,
  },
  {
    id: 20,
    productId: 20,
    filename: "predator-energy-500ml.jpg",
    path: "/images/products/predator-energy-500ml.jpg",
    alt: "PREDATOR Energy Drink 500ml",
    isPrimary: true,
  },
  {
    id: 21,
    productId: 21,
    filename: "powerplay-energy-500ml.jpg",
    path: "/images/products/powerplay-energy-500ml.jpg",
    alt: "POWER PLAY Energy Drink 500ml",
    isPrimary: true,
  },

  // Dairy Products
  {
    id: 22,
    productId: 22,
    filename: "milk-powder-25kg.jpg",
    path: "/images/products/milk-powder-25kg.jpg",
    alt: "Milk Powder 25kg",
    isPrimary: true,
  },
  {
    id: 23,
    productId: 23,
    filename: "lato-milk-500ml.jpg",
    path: "/images/products/lato-milk-500ml.jpg",
    alt: "Lato UHT Whole Milk 500ml",
    isPrimary: true,
  },
  {
    id: 24,
    productId: 24,
    filename: "lato-ghee-1kg.jpg",
    path: "/images/products/lato-ghee-1kg.jpg",
    alt: "Lato Pure Ghee 1kg",
    isPrimary: true,
  },
  {
    id: 25,
    productId: 25,
    filename: "lato-butter-500g.jpg",
    path: "/images/products/lato-butter-500g.jpg",
    alt: "Lato Butter 500g",
    isPrimary: true,
  },
  {
    id: 26,
    productId: 26,
    filename: "cheese-250g.jpg",
    path: "/images/products/cheese-250g.jpg",
    alt: "Cheese 250g",
    isPrimary: true,
  },

  // Personal Care & Hygiene
  {
    id: 27,
    productId: 27,
    filename: "menengai-soap-1kg.jpg",
    path: "/images/products/menengai-soap-1kg.jpg",
    alt: "MENENGAI Bar Soap 1kg",
    isPrimary: true,
  },
  {
    id: 28,
    productId: 28,
    filename: "msafi-soap-1kg.jpg",
    path: "/images/products/msafi-soap-1kg.jpg",
    alt: "MSAFI Bar Soap 1kg",
    isPrimary: true,
  },
  {
    id: 29,
    productId: 29,
    filename: "bidco-cream-soap-800g.jpg",
    path: "/images/products/bidco-cream-soap-800g.jpg",
    alt: "BIDCO Cream Bar Soap 800g",
    isPrimary: true,
  },

  // Cleaning Products
  {
    id: 30,
    productId: 30,
    filename: "livelle-toilet-tissue-4rolls.jpg",
    path: "/images/products/livelle-toilet-tissue-4rolls.jpg",
    alt: "Livelle Toilet Tissue 4 Rolls",
    isPrimary: true,
  },
  {
    id: 31,
    productId: 31,
    filename: "poshy-toilet-tissue-4rolls.jpg",
    path: "/images/products/poshy-toilet-tissue-4rolls.jpg",
    alt: "Poshy Roll Toilet Tissue 4 Rolls",
    isPrimary: true,
  },
  {
    id: 32,
    productId: 32,
    filename: "nuru-scouring-powder-500g.jpg",
    path: "/images/products/nuru-scouring-powder-500g.jpg",
    alt: "Nuru Scouring Powder 500g",
    isPrimary: true,
  },
  {
    id: 33,
    productId: 33,
    filename: "sunlight-washing-powder-500g.jpg",
    path: "/images/products/sunlight-washing-powder-500g.jpg",
    alt: "Sunlight Washing Powder 500g",
    isPrimary: true,
  },
  {
    id: 34,
    productId: 34,
    filename: "jik-bleach-regular-1.5l.jpg",
    path: "/images/products/jik-bleach-regular-1.5l.jpg",
    alt: "Jik Bleach Regular 1.5L",
    isPrimary: true,
  },
  {
    id: 35,
    productId: 35,
    filename: "harpic-power-plus-1l.jpg",
    path: "/images/products/harpic-power-plus-1l.jpg",
    alt: "Harpic Power Plus 1L",
    isPrimary: true,
  },

  // Baby Care
  {
    id: 36,
    productId: 36,
    filename: "softcare-diapers-small-48pcs.jpg",
    path: "/images/products/softcare-diapers-small-48pcs.jpg",
    alt: "Softcare Gold Baby Diapers Small 48pcs",
    isPrimary: true,
  },
  {
    id: 37,
    productId: 37,
    filename: "softcare-diapers-medium-42pcs.jpg",
    path: "/images/products/softcare-diapers-medium-42pcs.jpg",
    alt: "Softcare Gold Baby Diapers Medium 42pcs",
    isPrimary: true,
  },
  {
    id: 38,
    productId: 38,
    filename: "cuettie-diapers-small-48pcs.jpg",
    path: "/images/products/cuettie-diapers-small-48pcs.jpg",
    alt: "Cuettie Baby Diapers Small 48pcs",
    isPrimary: true,
  },
  {
    id: 39,
    productId: 39,
    filename: "sunny-adult-diapers-medium-10pcs.jpg",
    path: "/images/products/sunny-adult-diapers-medium-10pcs.jpg",
    alt: "Sunny Adult Diapers Medium 10pcs",
    isPrimary: true,
  },

  // Snacks & Confectionery
  {
    id: 40,
    productId: 40,
    filename: "krackles-crisps-30g.jpg",
    path: "/images/products/krackles-crisps-30g.jpg",
    alt: "Krackles Potato Crisps 30g",
    isPrimary: true,
  },
  {
    id: 41,
    productId: 41,
    filename: "mms-chocolate-200g.jpg",
    path: "/images/products/mms-chocolate-200g.jpg",
    alt: "M&M's Chocolate 200g",
    isPrimary: true,
  },
  {
    id: 42,
    productId: 42,
    filename: "haribo-cherries-80g.jpg",
    path: "/images/products/haribo-cherries-80g.jpg",
    alt: "Haribo Happy Cherries 80g",
    isPrimary: true,
  },
  {
    id: 43,
    productId: 43,
    filename: "kitkat-white-41.5g.jpg",
    path: "/images/products/kitkat-white-41.5g.jpg",
    alt: "Nestle KitKat White 41.5g",
    isPrimary: true,
  },

  // Canned Foods
  {
    id: 44,
    productId: 44,
    filename: "domee-peach-425g.jpg",
    path: "/images/products/domee-peach-425g.jpg",
    alt: "Domee Peach Halves 425g",
    isPrimary: true,
  },
  {
    id: 45,
    productId: 45,
    filename: "domee-lychees-567g.jpg",
    path: "/images/products/domee-lychees-567g.jpg",
    alt: "Domee Lychees 567g",
    isPrimary: true,
  },

  // Cereals & Legumes
  {
    id: 46,
    productId: 46,
    filename: "makueni-ndengu-90kg.jpg",
    path: "/images/products/makueni-ndengu-90kg.jpg",
    alt: "Makueni Ndengu 90kg",
    isPrimary: true,
  },
  {
    id: 47,
    productId: 47,
    filename: "nylon-ndengu-90kg.jpg",
    path: "/images/products/nylon-ndengu-90kg.jpg",
    alt: "Nylon Ndengu 90kg",
    isPrimary: true,
  },
  {
    id: 48,
    productId: 48,
    filename: "kamande-beans-50kg.jpg",
    path: "/images/products/kamande-beans-50kg.jpg",
    alt: "Kamande Beans 50kg",
    isPrimary: true,
  },

  // Household Items
  {
    id: 49,
    productId: 49,
    filename: "eggs-crate-30pcs.jpg",
    path: "/images/products/eggs-crate-30pcs.jpg",
    alt: "Eggs Crate 30 Pieces",
    isPrimary: true,
  },
  {
    id: 50,
    productId: 50,
    filename: "daawat-spaghetti-400g.jpg",
    path: "/images/products/daawat-spaghetti-400g.jpg",
    alt: "Daawat Spaghetti 400g",
    isPrimary: true,
  },
]

// Helper functions for image management
export const getProductImages = (productId: number): ProductImage[] => {
  return PRODUCT_IMAGES.filter((image) => image.productId === productId)
}

export const getPrimaryProductImage = (productId: number): ProductImage | undefined => {
  return PRODUCT_IMAGES.find((image) => image.productId === productId && image.isPrimary)
}

export const getImageByFilename = (filename: string): ProductImage | undefined => {
  return PRODUCT_IMAGES.find((image) => image.filename === filename)
}

// Image upload and management functions
export const generateImageFilename = (productName: string, brand: string, size: string): string => {
  const cleanName = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")

  const cleanBrand = brand ? brand.toLowerCase().replace(/[^a-z0-9]/g, "") + "-" : ""
  const cleanSize = size
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/\s+/g, "")

  return `${cleanBrand}${cleanName}-${cleanSize}.jpg`
}

export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  const maxSize = 5 * 1024 * 1024 // 5MB

  return allowedTypes.includes(file.type) && file.size <= maxSize
}
