export const formats = ["Favorites", "Trade", "Wishlist", "Archive"] as const;
export type Shelf = (typeof formats)[number];

export const rows = [
  { name: "Ember Sprite", set: "A1", qty: 4, price: "$1.50", shelf: "Favorites" },
  { name: "Glass Compass", set: "B7", qty: 2, price: "$2.10", shelf: "Trade" },
  { name: "Quiet Tide", set: "C3", qty: 3, price: "$1.80", shelf: "Favorites" },
  { name: "Lantern Moth", set: "A4", qty: 1, price: "$9.40", shelf: "Wishlist" },
  { name: "Iron Orchard", set: "D2", qty: 2, price: "$3.25", shelf: "Archive" },
] satisfies { name: string; set: string; qty: number; price: string; shelf: Shelf }[];
