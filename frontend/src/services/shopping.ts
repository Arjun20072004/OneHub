export interface ShoppingProduct {
  id: number;
  name: string;
  category: string;
  price: string;
  keywords: string[];
}

export const shoppingProducts: ShoppingProduct[] = [
  {
    id: 1,
    name: "Samsung Galaxy S25",
    category: "Mobiles & accessories",
    price: "₹74,999",
    keywords: [
      "phone",
      "mobile",
      "smartphone",
      "samsung",
      "galaxy",
      "android",
      "electronics",
    ],
  },
  {
    id: 2,
    name: "Noise smartwatch",
    category: "Electronics",
    price: "₹2,499",
    keywords: [
      "watch",
      "smartwatch",
      "noise",
      "wearable",
      "electronics",
    ],
  },
  {
    id: 3,
    name: "Everyday cotton shirts",
    category: "Fashion",
    price: "₹799",
    keywords: [
      "shirt",
      "shirts",
      "clothes",
      "fashion",
      "cotton",
      "clothing",
    ],
  },
  {
    id: 4,
    name: "Air fryer 4.2L",
    category: "Home & kitchen",
    price: "₹4,299",
    keywords: [
      "air fryer",
      "airfryer",
      "kitchen",
      "home",
      "appliance",
      "appliances",
    ],
  },
  {
    id: 5,
    name: "Wireless earbuds",
    category: "Electronics",
    price: "₹1,699",
    keywords: [
      "earbuds",
      "earphones",
      "wireless earbuds",
      "headphones",
      "audio",
      "electronics",
    ],
  },
  {
    id: 6,
    name: "Travel backpack",
    category: "Luggage",
    price: "₹1,299",
    keywords: [
      "backpack",
      "bag",
      "luggage",
      "travel bag",
      "travel",
    ],
  },
];

export function searchShoppingProducts(query: string): ShoppingProduct[] {
  const normalized = query.toLowerCase().trim();

  if (!normalized) {
    return shoppingProducts;
  }

  const words = normalized
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const results = shoppingProducts
    .map((product) => {
      const searchableText = [
        product.name,
        product.category,
        ...product.keywords,
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;

      if (searchableText.includes(normalized)) {
        score += 100;
      }

      for (const word of words) {
        if (word.length < 2) continue;

        if (product.name.toLowerCase().includes(word)) {
          score += 20;
        }

        if (product.category.toLowerCase().includes(word)) {
          score += 15;
        }

        if (
          product.keywords.some((keyword) =>
            keyword.toLowerCase().includes(word),
          )
        ) {
          score += 10;
        }
      }

      return {
        product,
        score,
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);

  return results.map((result) => result.product);
}