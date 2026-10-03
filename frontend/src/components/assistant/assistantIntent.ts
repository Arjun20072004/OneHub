export type AssistantIntent =
  | "doctor_search"
  | "food_search"
  | "travel_search"
  | "mechanic_search"
  | "shopping_search"
  | "order_search"
  | "general"
  | "unknown";

export type DoctorSpecialty =
  | "Cardiologist"
  | "Orthopedic surgeon"
  | "Dermatologist"
  | "Neurologist"
  | "Gynecologist"
  | "Gastroenterologist"
  | "Pediatrician"
  | "ENT specialist";

export interface AssistantUnderstanding {
  intent: AssistantIntent;
  specialty?: DoctorSpecialty;
  searchQuery?: string;
  confidence: number;
}

const doctorSpecialties: Array<{
  specialty: DoctorSpecialty;
  keywords: string[];
}> = [
  {
    specialty: "Cardiologist",
    keywords: [
      "cardiologist",
      "cardiology",
      "heart doctor",
      "heart specialist",
      "heart problem",
      "heart issue",
      "chest pain",
      "chest problem",
      "chest issue",
      "blood pressure",
      "high bp",
      "low bp",
      "heart pain",
    ],
  },
  {
    specialty: "Orthopedic surgeon",
    keywords: [
      "orthopedic",
      "orthopaedic",
      "orthopedic surgeon",
      "bone doctor",
      "bone specialist",
      "bone problem",
      "joint pain",
      "joint problem",
      "back pain",
      "knee pain",
      "shoulder pain",
      "fracture",
    ],
  },
  {
    specialty: "Dermatologist",
    keywords: [
      "dermatologist",
      "dermatology",
      "skin doctor",
      "skin specialist",
      "skin problem",
      "skin issue",
      "acne",
      "pimples",
      "rash",
      "itching skin",
    ],
  },
  {
    specialty: "Neurologist",
    keywords: [
      "neurologist",
      "neurology",
      "brain doctor",
      "brain specialist",
      "migraine",
      "nerve problem",
      "nerve pain",
      "seizure",
      "headache",
    ],
  },
  {
    specialty: "Gynecologist",
    keywords: [
      "gynecologist",
      "gynecology",
      "gynaecologist",
      "gynaecology",
      "women doctor",
      "women's health",
      "period problem",
      "period pain",
      "pregnancy",
    ],
  },
  {
    specialty: "Gastroenterologist",
    keywords: [
      "gastroenterologist",
      "gastroenterology",
      "stomach doctor",
      "stomach specialist",
      "stomach problem",
      "stomach pain",
      "digestion problem",
      "gastric",
      "acidity",
      "constipation",
      "diarrhea",
      "diarrhoea",
    ],
  },
  {
    specialty: "Pediatrician",
    keywords: [
      "pediatrician",
      "paediatrician",
      "pediatrics",
      "paediatrics",
      "child doctor",
      "child specialist",
      "children doctor",
      "baby doctor",
      "kid doctor",
    ],
  },
  {
    specialty: "ENT specialist",
    keywords: [
      "ent doctor",
      "ent specialist",
      "ear doctor",
      "nose doctor",
      "throat doctor",
      "ear problem",
      "nose problem",
      "throat problem",
      "sinus",
      "tonsil",
    ],
  },
];

const doctorKeywords = [
  "doctor",
  "doctors",
  "physician",
  "specialist",
  "medical specialist",
  "hospital",
  "clinic",
  "appointment",
  "consultation",
  "consult",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsKeyword(
  text: string,
  keyword: string,
): boolean {
  return text.includes(keyword);
}

export function understandRequest(
  question: string,
): AssistantUnderstanding {
  const normalized = normalize(question);

  /*
   * --------------------------------------------------
   * DOCTOR / MEDICAL
   *
   * Keep this BEFORE mechanic/food/general detection.
   * Medical keywords must have priority.
   * --------------------------------------------------
   */

  for (const entry of doctorSpecialties) {
    if (
      entry.keywords.some((keyword) =>
        containsKeyword(normalized, keyword),
      )
    ) {
      return {
        intent: "doctor_search",
        specialty: entry.specialty,
        searchQuery: question,
        confidence: 0.95,
      };
    }
  }

  if (
    doctorKeywords.some((keyword) =>
      containsKeyword(normalized, keyword),
    )
  ) {
    return {
      intent: "doctor_search",
      searchQuery: question,
      confidence: 0.85,
    };
  }

  /*
   * --------------------------------------------------
   * TRAVEL
   * --------------------------------------------------
   */

  if (
    [
      "flight",
      "flights",
      "fly",
      "airline",
      "hotel",
      "hotels",
      "train",
      "trains",
      "bus",
      "buses",
      "travel",
      "trip",
      "stay",
      "room",
    ].some((keyword) =>
      containsKeyword(normalized, keyword),
    )
  ) {
    return {
      intent: "travel_search",
      searchQuery: question,
      confidence: 0.9,
    };
  }

  /*
   * --------------------------------------------------
   * MECHANIC / ROADSIDE
   * --------------------------------------------------
   */

  if (
    [
      "mechanic",
      "mechanics",
      "fuel",
      "petrol",
      "diesel",
      "towing",
      "tow truck",
      "battery",
      "car battery",
      "tyre",
      "tire",
      "puncture",
      "roadside",
      "breakdown",
    ].some((keyword) =>
      containsKeyword(normalized, keyword),
    )
  ) {
    return {
      intent: "mechanic_search",
      searchQuery: question,
      confidence: 0.9,
    };
  }

  /*
   * --------------------------------------------------
   * FOOD
   * --------------------------------------------------
   */

  if (
    [
      "food",
      "restaurant",
      "restaurants",
      "biryani",
      "pizza",
      "burger",
      "meal",
      "eat",
      "eating",
      "hungry",
      "cuisine",
      "dish",
      "dishes",
    ].some((keyword) =>
      containsKeyword(normalized, keyword),
    )
  ) {
    return {
      intent: "food_search",
      searchQuery: question,
      confidence: 0.9,
    };
  }

  /*
   * --------------------------------------------------
   * SHOPPING
   * --------------------------------------------------
   */

  if (
    [
      "shopping",
      "shop",
      "product",
      "products",
      "buy",
      "purchase",
      "electronics",
      "clothes",
      "shoes",
    ].some((keyword) =>
      containsKeyword(normalized, keyword),
    )
  ) {
    return {
      intent: "shopping_search",
      searchQuery: question,
      confidence: 0.85,
    };
  }

  /*
   * --------------------------------------------------
   * ORDERS
   * --------------------------------------------------
   */

  if (
    [
      "my order",
      "order status",
      "track order",
      "where is my order",
      "delivery status",
      "my booking",
      "booking status",
    ].some((keyword) =>
      containsKeyword(normalized, keyword),
    )
  ) {
    return {
      intent: "order_search",
      searchQuery: question,
      confidence: 0.9,
    };
  }

  /*
   * --------------------------------------------------
   * GENERAL
   * --------------------------------------------------
   */

  if (
    normalized === "help" ||
    normalized.includes("what can onehub") ||
    normalized.includes("what can you do") ||
    normalized.includes("what do you do") ||
    normalized.includes("help me")
  ) {
    return {
      intent: "general",
      searchQuery: question,
      confidence: 0.95,
    };
  }

  return {
    intent: "unknown",
    searchQuery: question,
    confidence: 0.3,
  };
}