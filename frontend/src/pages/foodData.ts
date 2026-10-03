export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
};

export const spiceRouteMenu: MenuItem[] = [
  { id: "chicken-dum-biryani", name: "Chicken Dum Biryani", description: "Aromatic basmati rice, tender chicken and saffron spices", price: 289, category: "Biryani" },
  { id: "mutton-biryani", name: "Mutton Biryani", description: "Slow-cooked mutton with fragrant long-grain rice", price: 369, category: "Biryani" },
  { id: "paneer-tikka", name: "Paneer Tikka", description: "Charred cottage cheese, peppers and mint chutney", price: 249, category: "Starters" },
  { id: "dragon-chicken", name: "Dragon Chicken", description: "Crispy chicken tossed in a hot garlic chilli sauce", price: 279, category: "Chinese" },
  { id: "veg-hakka-noodles", name: "Veg Hakka Noodles", description: "Wok-tossed noodles with seasonal vegetables", price: 199, category: "Chinese" },
  { id: "gulab-jamun", name: "Gulab Jamun", description: "Warm syrup-soaked dumplings, two pieces", price: 99, category: "Desserts" },
];

export const restaurantName = "Spice Route Kitchen";
