import { nanoid } from "nanoid";

export const EVENT_TYPES = ["Mountain", "Ultra", "Urban"];
export const EVENT_STATUSES = ["completed", "upcoming", "wishlist"];

export const TYPE_COLORS = {
  Mountain: "#8b5cf6",
  Ultra: "#ef4444",
  Urban: "#f59e0b",
};

export const GRADIENT_PRESETS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)",
  "linear-gradient(135deg, #ff0844 0%, #ffb199 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
];

export const BADGE_EMOJIS = [
  "🏔️", "⛰️", "🚶", "🏙️", "🏆", "🎯", "🏃", "🥾",
  "🌄", "🗻", "🌊", "🏕️", "🔥", "⭐", "💪", "🎖️",
  "🏅", "🌙", "☀️", "❄️",
];

export function generateId() {
  return nanoid(8);
}

export function createEvent(overrides = {}) {
  return {
    id: generateId(),
    name: "",
    distance: null,
    type: "Mountain",
    elevation: null,
    location: "",
    status: "completed",
    date: null,
    time: null,
    completions: 1,
    peaks: [],
    story: "",
    lessons: "",
    conditions: null,
    difficulty: 3,
    badge: "🏔️",
    color: "#8b5cf6",
    heroImage: GRADIENT_PRESETS[0],
    photos: [],
    trainingWeeks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Upcoming-specific fields
    phase: null,
    week: null,
    progress: 0,
    route: "",
    reasons: [],
    watchOuts: [],
    // Wishlist-specific fields
    targetYear: null,
    appeal: "",
    // Kit & Nutrition
    kitList: [],
    nutritionPlan: "",
    // Costs
    costs: { entry: 0, travel: 0, accommodation: 0, gear: 0, food: 0, other: 0 },
    // Weather conditions
    weather: { temp: null, conditions: "", wind: "" },
    // Race review
    review: { rating: 0, wouldRepeat: null, organization: 0, courseQuality: 0 },
    // Nutrition/fueling log
    nutrition: [],
    ...overrides,
  };
}

export function validateEvent(event) {
  const errors = [];
  if (!event.name?.trim()) errors.push("Name is required");
  if (!EVENT_TYPES.includes(event.type)) errors.push("Invalid event type");
  return errors;
}
