import { Destination } from "@/types";

export const REGION_GRADIENT: Record<string, string> = {
  "Europe":      "linear-gradient(145deg, #1a3a6e 0%, #2d5fa8 100%)",
  "Asia":        "linear-gradient(145deg, #7A2E0E 0%, #C4541D 100%)",
  "Americas":    "linear-gradient(145deg, #1E4A1E 0%, #3A7A2E 100%)",
  "Africa":      "linear-gradient(145deg, #6B3A00 0%, #B87200 100%)",
  "Oceania":     "linear-gradient(145deg, #005C8A 0%, #0097A7 100%)",
  "Middle East": "linear-gradient(145deg, #1a3a38 0%, #2E6B60 100%)",
};

export const DESTINATION_VIBE: Record<string, string> = {
  "tokyo":                "neon + tradition",
  "kyoto":                "temples + seasons",
  "bali":                 "rice terraces + temples",
  "bangkok":              "street food + temples",
  "seoul":                "K-culture + cuisine",
  "singapore":            "rooftops + gardens",
  "vietnam-hanoi":        "old quarter + pho",
  "vietnam-hcm":          "energy + history",
  "india-rajasthan":      "palaces + desert",
  "maldives":             "overwater + coral",
  "paris":                "art + architecture",
  "rome":                 "ruins + gelato",
  "amalfi":               "cliffs + coast",
  "barcelona":            "Gaudí + beach",
  "madrid":               "museums + nightlife",
  "santorini":            "sunsets + caldera",
  "athens":               "Acropolis + souvlaki",
  "amsterdam":            "canals + museums",
  "prague":               "cobblestones + castles",
  "budapest":             "thermal baths + ruin bars",
  "lisbon":               "fado + Alfama hills",
  "london":               "pubs + parks",
  "edinburgh":            "castles + whisky",
  "dubrovnik":            "old town + Adriatic",
  "swiss-alps":           "mountains + chocolate",
  "istanbul":             "bazaars + Bosphorus",
  "morocco-marrakech":    "souks + riads",
  "morocco-fes":          "medina + ceramics",
  "egypt-cairo":          "pyramids + spice",
  "cape-town":            "Table Mountain + wine",
  "tanzania-serengeti":   "wildlife + migration",
  "kenya-masai":          "savanna + big five",
  "mexico-city":          "murals + tacos",
  "oaxaca":               "mezcal + markets",
  "tulum":                "cenotes + ruins",
  "colombia-cartagena":   "color + Caribbean",
  "colombia-medellin":    "innovation + flowers",
  "peru-lima":            "ceviche + coast",
  "peru-machu-picchu":    "Inca + mountains",
  "argentina-buenos-aires": "tango + beef",
  "patagonia":            "glaciers + wilderness",
  "brazil-rio":           "carnival + beaches",
  "costa-rica":           "rainforest + surf",
  "nyc":                  "skyline + culture",
  "la":                   "sun + studios",
  "new-orleans":          "jazz + creole",
  "hawaii":               "volcanoes + waves",
  "iceland":              "northern lights + geysers",
  "norway":               "fjords + midnight sun",
  "new-zealand":          "adventure + Maori",
  "australia-sydney":     "harbour + reef",
  "australia-uluru":      "red earth + sky",
  "fiji":                 "coral + kava",
  "dubai":                "skyline + desert",
  "jordan-petra":         "rose city + Wadi Rum",
  "israel-tel-aviv":      "beach + nightlife",
  "georgia-tbilisi":      "wine + Caucasus",
};

export const CURATED_DESTINATIONS: Destination[] = [
  // Asia
  { id: "tokyo", name: "Tokyo", country: "Japan", region: "Asia" },
  { id: "kyoto", name: "Kyoto", country: "Japan", region: "Asia" },
  { id: "osaka", name: "Osaka", country: "Japan", region: "Asia" },
  { id: "hiroshima", name: "Hiroshima", country: "Japan", region: "Asia" },
  { id: "bali", name: "Bali", country: "Indonesia", region: "Asia" },
  { id: "jakarta", name: "Jakarta", country: "Indonesia", region: "Asia" },
  { id: "bangkok", name: "Bangkok", country: "Thailand", region: "Asia" },
  { id: "chiang-mai", name: "Chiang Mai", country: "Thailand", region: "Asia" },
  { id: "phuket", name: "Phuket", country: "Thailand", region: "Asia" },
  { id: "seoul", name: "Seoul", country: "South Korea", region: "Asia" },
  { id: "busan", name: "Busan", country: "South Korea", region: "Asia" },
  { id: "singapore", name: "Singapore", country: "Singapore", region: "Asia" },
  { id: "vietnam-hanoi", name: "Hanoi", country: "Vietnam", region: "Asia" },
  { id: "vietnam-hcm", name: "Ho Chi Minh City", country: "Vietnam", region: "Asia" },
  { id: "vietnam-hoi-an", name: "Hoi An", country: "Vietnam", region: "Asia" },
  { id: "india-rajasthan", name: "Rajasthan", country: "India", region: "Asia" },
  { id: "india-mumbai", name: "Mumbai", country: "India", region: "Asia" },
  { id: "india-delhi", name: "Delhi", country: "India", region: "Asia" },
  { id: "india-goa", name: "Goa", country: "India", region: "Asia" },
  { id: "india-kerala", name: "Kerala", country: "India", region: "Asia" },
  { id: "maldives", name: "Maldives", country: "Maldives", region: "Asia" },
  { id: "srilanka", name: "Sri Lanka", country: "Sri Lanka", region: "Asia" },
  { id: "nepal-kathmandu", name: "Kathmandu", country: "Nepal", region: "Asia" },
  { id: "nepal-himalaya", name: "Himalayan Trek", country: "Nepal", region: "Asia" },
  { id: "myanmar-bagan", name: "Bagan", country: "Myanmar", region: "Asia" },
  { id: "cambodia-siem-reap", name: "Siem Reap", country: "Cambodia", region: "Asia" },
  { id: "laos-luang", name: "Luang Prabang", country: "Laos", region: "Asia" },
  { id: "malaysia-kuala", name: "Kuala Lumpur", country: "Malaysia", region: "Asia" },
  { id: "malaysia-penang", name: "Penang", country: "Malaysia", region: "Asia" },
  { id: "philippines-palawan", name: "Palawan", country: "Philippines", region: "Asia" },
  { id: "taiwan-taipei", name: "Taipei", country: "Taiwan", region: "Asia" },
  { id: "hong-kong", name: "Hong Kong", country: "China", region: "Asia" },
  { id: "china-beijing", name: "Beijing", country: "China", region: "Asia" },
  { id: "china-shanghai", name: "Shanghai", country: "China", region: "Asia" },
  { id: "china-guilin", name: "Guilin", country: "China", region: "Asia" },
  { id: "mongolia", name: "Mongolia", country: "Mongolia", region: "Asia" },

  // Europe
  { id: "paris", name: "Paris", country: "France", region: "Europe" },
  { id: "nice", name: "Nice", country: "France", region: "Europe" },
  { id: "marseille", name: "Marseille", country: "France", region: "Europe" },
  { id: "rome", name: "Rome", country: "Italy", region: "Europe" },
  { id: "florence", name: "Florence", country: "Italy", region: "Europe" },
  { id: "venice", name: "Venice", country: "Italy", region: "Europe" },
  { id: "milan", name: "Milan", country: "Italy", region: "Europe" },
  { id: "amalfi", name: "Amalfi Coast", country: "Italy", region: "Europe" },
  { id: "sicily", name: "Sicily", country: "Italy", region: "Europe" },
  { id: "barcelona", name: "Barcelona", country: "Spain", region: "Europe" },
  { id: "madrid", name: "Madrid", country: "Spain", region: "Europe" },
  { id: "seville", name: "Seville", country: "Spain", region: "Europe" },
  { id: "granada", name: "Granada", country: "Spain", region: "Europe" },
  { id: "ibiza", name: "Ibiza", country: "Spain", region: "Europe" },
  { id: "santorini", name: "Santorini", country: "Greece", region: "Europe" },
  { id: "mykonos", name: "Mykonos", country: "Greece", region: "Europe" },
  { id: "athens", name: "Athens", country: "Greece", region: "Europe" },
  { id: "crete", name: "Crete", country: "Greece", region: "Europe" },
  { id: "amsterdam", name: "Amsterdam", country: "Netherlands", region: "Europe" },
  { id: "prague", name: "Prague", country: "Czech Republic", region: "Europe" },
  { id: "budapest", name: "Budapest", country: "Hungary", region: "Europe" },
  { id: "lisbon", name: "Lisbon", country: "Portugal", region: "Europe" },
  { id: "porto", name: "Porto", country: "Portugal", region: "Europe" },
  { id: "algarve", name: "Algarve", country: "Portugal", region: "Europe" },
  { id: "london", name: "London", country: "UK", region: "Europe" },
  { id: "edinburgh", name: "Edinburgh", country: "Scotland", region: "Europe" },
  { id: "dublin", name: "Dublin", country: "Ireland", region: "Europe" },
  { id: "dubrovnik", name: "Dubrovnik", country: "Croatia", region: "Europe" },
  { id: "split", name: "Split", country: "Croatia", region: "Europe" },
  { id: "kotor", name: "Kotor", country: "Montenegro", region: "Europe" },
  { id: "swiss-alps", name: "Swiss Alps", country: "Switzerland", region: "Europe" },
  { id: "zurich", name: "Zurich", country: "Switzerland", region: "Europe" },
  { id: "bern", name: "Bern", country: "Switzerland", region: "Europe" },
  { id: "istanbul", name: "Istanbul", country: "Turkey", region: "Europe" },
  { id: "cappadocia", name: "Cappadocia", country: "Turkey", region: "Europe" },
  { id: "iceland", name: "Iceland", country: "Iceland", region: "Europe" },
  { id: "norway", name: "Norwegian Fjords", country: "Norway", region: "Europe" },
  { id: "oslo", name: "Oslo", country: "Norway", region: "Europe" },
  { id: "copenhagen", name: "Copenhagen", country: "Denmark", region: "Europe" },
  { id: "stockholm", name: "Stockholm", country: "Sweden", region: "Europe" },
  { id: "helsinki", name: "Helsinki", country: "Finland", region: "Europe" },
  { id: "reykjavik", name: "Reykjavik", country: "Iceland", region: "Europe" },
  { id: "berlin", name: "Berlin", country: "Germany", region: "Europe" },
  { id: "munich", name: "Munich", country: "Germany", region: "Europe" },
  { id: "vienna", name: "Vienna", country: "Austria", region: "Europe" },
  { id: "salzburg", name: "Salzburg", country: "Austria", region: "Europe" },
  { id: "brussels", name: "Brussels", country: "Belgium", region: "Europe" },
  { id: "bruges", name: "Bruges", country: "Belgium", region: "Europe" },
  { id: "tallinn", name: "Tallinn", country: "Estonia", region: "Europe" },
  { id: "riga", name: "Riga", country: "Latvia", region: "Europe" },
  { id: "vilnius", name: "Vilnius", country: "Lithuania", region: "Europe" },
  { id: "krakow", name: "Krakow", country: "Poland", region: "Europe" },
  { id: "warsaw", name: "Warsaw", country: "Poland", region: "Europe" },
  { id: "sofia", name: "Sofia", country: "Bulgaria", region: "Europe" },
  { id: "bucharest", name: "Bucharest", country: "Romania", region: "Europe" },
  { id: "transylvania", name: "Transylvania", country: "Romania", region: "Europe" },
  { id: "montenegro", name: "Montenegro", country: "Montenegro", region: "Europe" },
  { id: "albania-tirana", name: "Tirana", country: "Albania", region: "Europe" },
  { id: "thessaloniki", name: "Thessaloniki", country: "Greece", region: "Europe" },
  { id: "valletta", name: "Valletta", country: "Malta", region: "Europe" },

  // Africa
  { id: "morocco-marrakech", name: "Marrakech", country: "Morocco", region: "Africa" },
  { id: "morocco-fes", name: "Fes", country: "Morocco", region: "Africa" },
  { id: "morocco-chefchaouen", name: "Chefchaouen", country: "Morocco", region: "Africa" },
  { id: "egypt-cairo", name: "Cairo", country: "Egypt", region: "Africa" },
  { id: "egypt-luxor", name: "Luxor", country: "Egypt", region: "Africa" },
  { id: "cape-town", name: "Cape Town", country: "South Africa", region: "Africa" },
  { id: "johannesburg", name: "Johannesburg", country: "South Africa", region: "Africa" },
  { id: "tanzania-serengeti", name: "Serengeti", country: "Tanzania", region: "Africa" },
  { id: "tanzania-zanzibar", name: "Zanzibar", country: "Tanzania", region: "Africa" },
  { id: "kenya-masai", name: "Masai Mara", country: "Kenya", region: "Africa" },
  { id: "kenya-nairobi", name: "Nairobi", country: "Kenya", region: "Africa" },
  { id: "rwanda", name: "Rwanda", country: "Rwanda", region: "Africa" },
  { id: "ethiopia-addis", name: "Addis Ababa", country: "Ethiopia", region: "Africa" },
  { id: "ghana-accra", name: "Accra", country: "Ghana", region: "Africa" },
  { id: "senegal-dakar", name: "Dakar", country: "Senegal", region: "Africa" },
  { id: "nigeria-lagos", name: "Lagos", country: "Nigeria", region: "Africa" },
  { id: "mauritius", name: "Mauritius", country: "Mauritius", region: "Africa" },

  // Americas
  { id: "mexico-city", name: "Mexico City", country: "Mexico", region: "Americas" },
  { id: "oaxaca", name: "Oaxaca", country: "Mexico", region: "Americas" },
  { id: "tulum", name: "Tulum", country: "Mexico", region: "Americas" },
  { id: "cancun", name: "Cancun", country: "Mexico", region: "Americas" },
  { id: "guadalajara", name: "Guadalajara", country: "Mexico", region: "Americas" },
  { id: "colombia-cartagena", name: "Cartagena", country: "Colombia", region: "Americas" },
  { id: "colombia-medellin", name: "Medellin", country: "Colombia", region: "Americas" },
  { id: "colombia-bogota", name: "Bogota", country: "Colombia", region: "Americas" },
  { id: "peru-lima", name: "Lima", country: "Peru", region: "Americas" },
  { id: "peru-machu-picchu", name: "Machu Picchu", country: "Peru", region: "Americas" },
  { id: "peru-cusco", name: "Cusco", country: "Peru", region: "Americas" },
  { id: "argentina-buenos-aires", name: "Buenos Aires", country: "Argentina", region: "Americas" },
  { id: "argentina-mendoza", name: "Mendoza", country: "Argentina", region: "Americas" },
  { id: "patagonia", name: "Patagonia", country: "Argentina / Chile", region: "Americas" },
  { id: "chile-santiago", name: "Santiago", country: "Chile", region: "Americas" },
  { id: "brazil-rio", name: "Rio de Janeiro", country: "Brazil", region: "Americas" },
  { id: "brazil-sao-paulo", name: "São Paulo", country: "Brazil", region: "Americas" },
  { id: "brazil-salvador", name: "Salvador", country: "Brazil", region: "Americas" },
  { id: "costa-rica", name: "Costa Rica", country: "Costa Rica", region: "Americas" },
  { id: "belize", name: "Belize", country: "Belize", region: "Americas" },
  { id: "cuba-havana", name: "Havana", country: "Cuba", region: "Americas" },
  { id: "jamaica", name: "Jamaica", country: "Jamaica", region: "Americas" },
  { id: "puerto-rico", name: "Puerto Rico", country: "USA", region: "Americas" },
  { id: "dominican-republic", name: "Dominican Republic", country: "Dominican Republic", region: "Americas" },
  { id: "nyc", name: "New York City", country: "USA", region: "Americas" },
  { id: "la", name: "Los Angeles", country: "USA", region: "Americas" },
  { id: "miami", name: "Miami", country: "USA", region: "Americas" },
  { id: "new-orleans", name: "New Orleans", country: "USA", region: "Americas" },
  { id: "chicago", name: "Chicago", country: "USA", region: "Americas" },
  { id: "nashville", name: "Nashville", country: "USA", region: "Americas" },
  { id: "san-francisco", name: "San Francisco", country: "USA", region: "Americas" },
  { id: "seattle", name: "Seattle", country: "USA", region: "Americas" },
  { id: "hawaii", name: "Hawaii", country: "USA", region: "Americas" },
  { id: "las-vegas", name: "Las Vegas", country: "USA", region: "Americas" },
  { id: "austin", name: "Austin", country: "USA", region: "Americas" },
  { id: "portland-or", name: "Portland", country: "USA", region: "Americas" },
  { id: "canada-toronto", name: "Toronto", country: "Canada", region: "Americas" },
  { id: "canada-vancouver", name: "Vancouver", country: "Canada", region: "Americas" },
  { id: "canada-montreal", name: "Montreal", country: "Canada", region: "Americas" },
  { id: "canada-banff", name: "Banff", country: "Canada", region: "Americas" },

  // Oceania
  { id: "new-zealand", name: "New Zealand", country: "New Zealand", region: "Oceania" },
  { id: "new-zealand-queenstown", name: "Queenstown", country: "New Zealand", region: "Oceania" },
  { id: "australia-sydney", name: "Sydney", country: "Australia", region: "Oceania" },
  { id: "australia-melbourne", name: "Melbourne", country: "Australia", region: "Oceania" },
  { id: "australia-cairns", name: "Cairns", country: "Australia", region: "Oceania" },
  { id: "australia-uluru", name: "Uluru", country: "Australia", region: "Oceania" },
  { id: "fiji", name: "Fiji", country: "Fiji", region: "Oceania" },
  { id: "bora-bora", name: "Bora Bora", country: "French Polynesia", region: "Oceania" },
  { id: "tahiti", name: "Tahiti", country: "French Polynesia", region: "Oceania" },
  { id: "hawaii", name: "Hawaii", country: "USA", region: "Oceania" },
  { id: "palau", name: "Palau", country: "Palau", region: "Oceania" },

  // Middle East
  { id: "dubai", name: "Dubai", country: "UAE", region: "Middle East" },
  { id: "abu-dhabi", name: "Abu Dhabi", country: "UAE", region: "Middle East" },
  { id: "jordan-petra", name: "Petra", country: "Jordan", region: "Middle East" },
  { id: "jordan-wadi-rum", name: "Wadi Rum", country: "Jordan", region: "Middle East" },
  { id: "israel-tel-aviv", name: "Tel Aviv", country: "Israel", region: "Middle East" },
  { id: "israel-jerusalem", name: "Jerusalem", country: "Israel", region: "Middle East" },
  { id: "georgia-tbilisi", name: "Tbilisi", country: "Georgia", region: "Middle East" },
  { id: "oman-muscat", name: "Muscat", country: "Oman", region: "Middle East" },
  { id: "saudi-riyadh", name: "Riyadh", country: "Saudi Arabia", region: "Middle East" },
  { id: "bahrain", name: "Bahrain", country: "Bahrain", region: "Middle East" },
  { id: "armenia-yerevan", name: "Yerevan", country: "Armenia", region: "Middle East" },
];

// Local search — fast, no network needed
export function searchLocalDestinations(query: string): Destination[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return CURATED_DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q) ||
      d.region.toLowerCase().includes(q)
  ).slice(0, 10);
}

export async function searchDestinations(query: string): Promise<Destination[]> {
  if (!query.trim()) return [];

  const local = searchLocalDestinations(query);
  if (local.length >= 4) return local;

  // Fall back to Nominatim only if local results are sparse
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&featuretype=city,country,region`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    const external: Destination[] = data
      .filter((r: { type: string }) =>
        ["city", "town", "country", "region", "state"].includes(r.type)
      )
      .map((r: { display_name: string }) => {
        const parts = r.display_name.split(", ");
        return {
          id: `ext-${parts[0].toLowerCase().replace(/\s+/g, "-")}`,
          name: parts[0],
          country: parts[parts.length - 1],
          region: "Other",
        };
      })
      .filter(
        (r: Destination) =>
          !local.some((c) => c.name.toLowerCase() === r.name.toLowerCase())
      );

    return [...local, ...external].slice(0, 10);
  } catch {
    return local.slice(0, 10);
  }
}
