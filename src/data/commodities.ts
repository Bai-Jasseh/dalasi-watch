export type Category = "Essentials" | "Protein" | "Produce" | "Utilities";

export interface Commodity {
  id: string;
  name: string;
  unit: string;
  category: Category;
  recommended: number; // Ministry recommended price (GMD)
  imported?: boolean;
  fish?: boolean;
}

export interface Region {
  id: string;
  name: string;
  division: string;
  inland?: boolean;
  coastal?: boolean;
  urban?: boolean;
}

export const REGIONS: Region[] = [
  { id: "banjul", name: "Banjul", division: "Banjul", urban: true },
  { id: "kanifing", name: "Kanifing (Serekunda)", division: "Kanifing", urban: true },
  { id: "brikama", name: "Brikama / Tanji", division: "West Coast", coastal: true },
  { id: "soma", name: "Soma", division: "Lower River" },
  { id: "farafenni", name: "Farafenni", division: "North Bank" },
  { id: "bansang", name: "Bansang", division: "Central River", inland: true },
  { id: "basse", name: "Basse", division: "Upper River", inland: true },
];

export const COMMODITIES: Commodity[] = [
  // Essentials
  { id: "rice-sadam", name: "Rice (Sadam)", unit: "50kg bag", category: "Essentials", recommended: 2200, imported: true },
  { id: "rice-broken", name: "Rice (Broken)", unit: "50kg bag", category: "Essentials", recommended: 2050, imported: true },
  { id: "rice-american", name: "Rice (American)", unit: "50kg bag", category: "Essentials", recommended: 2600, imported: true },
  { id: "sugar-50", name: "Sugar", unit: "50kg bag", category: "Essentials", recommended: 3200, imported: true },
  { id: "sugar-1", name: "Sugar", unit: "1kg", category: "Essentials", recommended: 75, imported: true },
  { id: "flour", name: "Flour", unit: "50kg bag", category: "Essentials", recommended: 1850, imported: true },
  { id: "oil-20", name: "Cooking Oil", unit: "20L", category: "Essentials", recommended: 2400, imported: true },
  { id: "oil-5", name: "Cooking Oil", unit: "5L", category: "Essentials", recommended: 650, imported: true },
  { id: "oil-1", name: "Cooking Oil", unit: "1L", category: "Essentials", recommended: 145, imported: true },

  // Protein
  { id: "fish-bonga", name: "Bonga Fish", unit: "kg", category: "Protein", recommended: 80, fish: true },
  { id: "fish-ladyfish", name: "Ladyfish", unit: "kg", category: "Protein", recommended: 180, fish: true },
  { id: "beef-bone", name: "Beef (with bone)", unit: "kg", category: "Protein", recommended: 320 },
  { id: "beef-nobone", name: "Beef (boneless)", unit: "kg", category: "Protein", recommended: 420 },
  { id: "chicken-local", name: "Chicken (Local)", unit: "whole", category: "Protein", recommended: 550 },
  { id: "chicken-carton", name: "Chicken (Carton)", unit: "carton", category: "Protein", recommended: 1900, imported: true },
  { id: "eggs", name: "Eggs", unit: "crate (30)", category: "Protein", recommended: 220 },

  // Produce
  { id: "onion-local", name: "Onions (Local)", unit: "kg", category: "Produce", recommended: 60 },
  { id: "onion-holland", name: "Onions (Holland)", unit: "kg", category: "Produce", recommended: 90, imported: true },
  { id: "potato", name: "Potatoes", unit: "kg", category: "Produce", recommended: 75, imported: true },
  { id: "tomato", name: "Tomatoes", unit: "kg", category: "Produce", recommended: 90 },
  { id: "bitter-tomato", name: "Bitter Tomato", unit: "kg", category: "Produce", recommended: 70 },
  { id: "pepper", name: "Peppers", unit: "kg", category: "Produce", recommended: 110 },

  // Utilities
  { id: "charcoal", name: "Charcoal", unit: "large bag", category: "Utilities", recommended: 950 },
  { id: "firewood", name: "Firewood", unit: "bundle", category: "Utilities", recommended: 220 },
  { id: "gas-12", name: "Gas Cylinder", unit: "12.5kg", category: "Utilities", recommended: 1450, imported: true },
];

export const CATEGORIES: Category[] = ["Essentials", "Protein", "Produce", "Utilities"];

export const MINISTRY_FEED = [
  "Ministry of Trade caps Sugar (1kg) at GMD 75 nationwide.",
  "New cooking oil shipment arrives at Banjul Port — prices expected to stabilize.",
  "Ramadan price-control task force activated across all 7 regions.",
  "Public notice: report price gouging via the DalasiWatch Citizen Reporting tool.",
  "Subsidy program extended for rice and flour through Q2.",
];
