/** Panco catalog data — edit this file to update product names, pricing, imagery, variants, and product-detail copy. */
export type Product = {
  slug: string;
  name: string;
  category: string;
  price: string;
  was?: string;
  image: string;
  gallery: string[];
  swatches: string[];
  colors: { name: string; color: string; image: string }[];
  tag?: string;
  description: string;
  highlights: string[];
};

export const pancoAssetUrl = (path: string) => path.startsWith("/manus-storage/") ? `https://northshop-zgmh8cdf.manus.space${path}` : path;

const rawCatalogProducts: Product[] = [
  {
    slug: "atlas-card-wallet",
    name: "Atlas Card Wallet",
    category: "Small leather goods",
    price: "$78",
    was: "$92",
    image: "/manus-storage/panco-atlas-wallet-angle_284697ca.jpg",
    gallery: [
      "/manus-storage/panco-atlas-wallet-angle_284697ca.jpg",
      "/manus-storage/panco-atlas-wallet-interior_26a2cff9.jpg",
      "/manus-storage/panco-atlas-wallet-editorial-final_26f31ab6.jpg",
    ],
    swatches: ["#66363f", "#352a2a"],
    colors: [
      { name: "Oxblood", color: "#66363f", image: "/manus-storage/panco-atlas-wallet-editorial-final_26f31ab6.jpg" },
      { name: "Night brown", color: "#352a2a", image: "/manus-storage/panco-atlas-wallet-angle_284697ca.jpg" },
    ],
    tag: "New",
    description: "A compact wallet cut for the cards, cash, and small routines that stay closest. Light in the hand, softly structured, and finished to improve with use.",
    highlights: ["Four card slots with a folded bill pocket", "Vegetable-tanned full-grain leather", "Hand-burnished edges and saddle stitching", "Small enough for front-pocket carry"],
  },
  {
    slug: "morrow-tote",
    name: "Morrow Tote",
    category: "Daily carry",
    price: "$248",
    image: "/manus-storage/panco-morrow-tote-editorial-final_897513e4.jpg",
    gallery: [
      "/manus-storage/panco-morrow-tote-editorial-final_897513e4.jpg",
      "/manus-storage/north-atelier-workshop_151c4843.jpg",
      "/manus-storage/north-atelier-hero_6fac9d50.jpg",
    ],
    swatches: ["#A45F3D", "#8A593C"],
    colors: [
      { name: "Saddle", color: "#A45F3D", image: "/manus-storage/panco-morrow-tote-editorial-final_897513e4.jpg" },
      { name: "Umber", color: "#8A593C", image: "/manus-storage/north-atelier-hero_6fac9d50.jpg" },
    ],
    description: "A generous everyday tote balanced between soft proportion and uncomplicated utility. Built for a notebook, a layer, and the objects that make a day work.",
    highlights: ["Magnetic top closure", "Interior hanging pocket", "Comfortable shoulder straps", "Solid brass hardware"],
  },
  {
    slug: "rook-field-bag",
    name: "Rook Field Bag",
    category: "Shoulder bag",
    price: "$186",
    was: "$214",
    image: "/manus-storage/panco-rook-field-bag-editorial-final_4c404ab1.jpg",
    gallery: [
      "/manus-storage/panco-rook-field-bag-editorial-final_4c404ab1.jpg",
      "/manus-storage/north-atelier-workshop_151c4843.jpg",
      "/manus-storage/north-atelier-cardholder_12ba7095.jpg",
    ],
    swatches: ["#A55E33", "#633B22"],
    colors: [
      { name: "Cedar", color: "#A55E33", image: "/manus-storage/panco-rook-field-bag-editorial-final_4c404ab1.jpg" },
      { name: "Chestnut", color: "#633B22", image: "/manus-storage/north-atelier-cardholder_12ba7095.jpg" },
    ],
    tag: "Studio edit",
    description: "A field-sized bag for the things that should be within reach. Its compact silhouette carries the small architecture of a day without asking for attention.",
    highlights: ["Adjustable shoulder strap", "Front utility pocket", "Soft-lined interior", "Made in a limited workshop run"],
  },
  {
    slug: "long-mile-duffle",
    name: "Long Mile Duffle",
    category: "Weekend carry",
    price: "$320",
    image: "/manus-storage/panco-long-mile-duffle-hero_3cb326bc.jpg",
    gallery: [
      "/manus-storage/panco-long-mile-duffle-hero_3cb326bc.jpg",
      "/manus-storage/north-atelier-workshop_151c4843.jpg",
      "/manus-storage/north-atelier-tote_a6b855c4.jpg",
    ],
    swatches: ["#6D3D24", "#352B22"],
    colors: [
      { name: "Oxhide", color: "#6D3D24", image: "/manus-storage/panco-long-mile-duffle-hero_3cb326bc.jpg" },
      { name: "Dark umber", color: "#352B22", image: "/manus-storage/north-atelier-workshop_151c4843.jpg" },
    ],
    description: "A soft-sided duffle for one good night away or a few days beyond the familiar. Balanced carry, durable zips, and a shape that gets better with every trip.",
    highlights: ["Wide zip opening", "Removable shoulder strap", "Reinforced leather base", "Cabin-ready proportions"],
  },
];

export const catalogProducts: Product[] = rawCatalogProducts.map(product => ({
  ...product,
  image: pancoAssetUrl(product.image),
  gallery: product.gallery.map(pancoAssetUrl),
  colors: product.colors.map(color => ({ ...color, image: pancoAssetUrl(color.image) })),
}));

export function getProduct(slug: string) {
  return catalogProducts.find((product) => product.slug === slug);
}
