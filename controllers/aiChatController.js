import { generateContent } from "../services/ai/llmService.js";
import ProviderProfile from "../models/ProviderProfile.js";
import serviceIntents from "../data/serviceIntents.js";
import actionIntents from "../data/actionIntents.js";

// ==========================
// DEFAULT / HOME SUGGESTIONS
// ==========================

const HOME_SUGGESTIONS = [
  "🔧 Find Plumber",
  "⚡ Find Electrician",
  "🚗 Find Driver",
  "🧹 House Cleaning",
  "🍳 Find Cook",
  "📚 Find Home Tutor",
];

// Per-category follow-up chips shown right after a category search.
// Falls back to a generic set for any category not listed here, so new
// categories added to the DB never break chip generation.
const subCategoryFollowUps = {
  Plumber: ["🚿 Leakage", "🚽 Toilet Repair", "🔧 Pipe Installation", "🔥 Geyser Repair"],
  Electrician: ["💡 Wiring Issue", "🔌 Switchboard Repair", "🌀 Fan Installation", "🔋 Inverter Setup"],
  Driver: ["🚖 Outstation Trip", "🕐 Hourly Driver", "🚙 Monthly Driver"],
  Cleaner: ["🏠 Full House Cleaning", "🛋️ Sofa Cleaning", "🪟 Deep Cleaning"],
  Cook: ["🍛 Daily Cook", "🎉 Party Cooking", "🥗 Diet Meal Prep"],
  Tutor: ["📖 School Subjects", "🧮 Maths Tutor", "🗣️ Language Tutor"],
};

const getSubCategoryFollowUps = (category) =>
  subCategoryFollowUps[category] || [
    `🔎 More ${category} Options`,
    "💰 Cheapest",
    "⭐ Highest Rated",
  ];

// ==========================
// SUGGESTION ENGINE
// ==========================
// Single source of truth for chips shown under every AI reply.
// `context` tells it what just happened so it can react instead of
// always returning the same static list.
//
// context = {
//   providers: Provider[]   // providers attached to this reply, if any
//   category: string        // detected/matched category, if any
//   action: "view_profile" | "book_provider" | null
//   stage: "greeting" | "no_results" | "general" | undefined
// }
const getSuggestions = (context = {}) => {
  const { providers = [], category = "", action = null, stage } = context;

  // Just booked or opened a profile -> give next logical steps
  if (action === "book_provider") {
    return [
      "📅 Track Booking",
      "💬 Message Provider",
      "🔍 Find Another Service",
      "🏠 Go Home",
    ];
  }

  if (action === "view_profile") {
    return [
      "📅 Book This Provider",
      "⭐ View Reviews",
      "🔍 Find Another Service",
      "🏠 Go Home",
    ];
  }

  // Providers were returned -> offer ways to narrow down / act
  if (providers.length > 0) {
    return [
      "👤 View Best Provider",
      "💰 Cheapest",
      "⭐ Highest Rated",
      "📅 Book Provider",
      ...(category ? getSubCategoryFollowUps(category).slice(0, 2) : []),
    ];
  }

  // Search happened but nothing found
  if (stage === "no_results") {
    return [
      ...HOME_SUGGESTIONS.filter((s) => !category || !s.toLowerCase().includes(category.toLowerCase())),
      "🏠 Go Home",
    ].slice(0, 4);
  }

  // Explicit greeting
  if (stage === "greeting") {
    return HOME_SUGGESTIONS;
  }

  // General small talk / anything else with no useful state
  return HOME_SUGGESTIONS;
};

// ==========================
// STEP 1 — Direct provider name search
// ==========================

const findDirectProviderByName = (allProviders, lowerMessage) => {
  return allProviders.find((provider) => {
    const fullName = provider.userId.name.toLowerCase();
    const nameParts = fullName.split(" ");

    return (
      lowerMessage.includes(fullName) ||
      nameParts.some((part) => lowerMessage.includes(part))
    );
  });
};

const detectAction = (lowerMessage) => {
  for (const [action, keywords] of Object.entries(actionIntents)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword.toLowerCase()))) {
      return action;
    }
  }
  return null;
};

const isGreeting = (lowerMessage) =>
  ["hi", "hello", "hey", "namaste", "yo"].some(
    (greet) => lowerMessage === greet || lowerMessage.startsWith(`${greet} `)
  );

// ==========================
// STEP 2 — Follow-up actions (acts on lastProviders, no LLM call)
// ==========================

const handleFollowUp = (lowerMessage, lastProviders) => {
  if (!lastProviders.length) return null;

  // Cheapest provider
  if (
    lowerMessage.includes("cheapest") ||
    lowerMessage.includes("cheap") ||
    lowerMessage.includes("affordable")
  ) {
    const cheapest = [...lastProviders].sort(
      (a, b) => a.priceAmount - b.priceAmount
    )[0];

    return {
      success: true,
      action: "book_provider",
      provider: cheapest,
      reply: `The cheapest provider is ${cheapest.userId.name} for ₹${cheapest.priceAmount}/${cheapest.priceType}.`,
      suggestions: getSuggestions({ action: "book_provider" }),
    };
  }

  // Highest rated
  if (
    lowerMessage.includes("best") ||
    lowerMessage.includes("highest rating") ||
    lowerMessage.includes("top rated")
  ) {
    const best = [...lastProviders].sort(
      (a, b) => b.averageRating - a.averageRating
    )[0];

    return {
      success: true,
      action: "view_profile",
      provider: best,
      reply: `${best.userId.name} has the highest rating (${best.averageRating}⭐).`,
      suggestions: getSuggestions({ action: "view_profile" }),
    };
  }

  // By provider name (matches on first/last name, not just full name)
  const matched = lastProviders.find((provider) => {
    const nameParts = provider.userId.name.toLowerCase().split(" ");
    return nameParts.some((part) => lowerMessage.includes(part));
  });

  if (matched) {
    const action = detectAction(lowerMessage);

    if (action === "view_profile") {
      return {
        success: true,
        action: "view_profile",
        provider: matched,
        reply: `Opening ${matched.userId.name}'s profile.`,
        suggestions: getSuggestions({ action: "view_profile" }),
      };
    }

    if (action === "book_provider") {
      return {
        success: true,
        action: "book_provider",
        provider: matched,
        reply: `Booking ${matched.userId.name}.`,
        suggestions: getSuggestions({ action: "book_provider" }),
      };
    }
  }

  return null;
};

// ==========================
// STEP 3 — Intent extraction
// ==========================

const buildIntentPrompt = (message, categories) => `
You are an AI intent extractor for Handio.

Extract the user's request into JSON.

Return ONLY valid JSON.

Schema:

{
  "intent":"search_provider" | "general",
  "category":"",
  "city":"",
  "budget":""
}

AVAILABLE CATEGORIES:

${categories.join("\n")}

Rules:
- If user is looking for a service provider, use "search_provider".
- Choose ONLY ONE category from the available categories above.
- Never invent a new category.
- If nothing matches, return an empty category.
- Detect city.
- If user says cheap, affordable, economical or low price -> budget="cheap".
- Missing values should be empty string.
- Return ONLY JSON.

User:
${message}
`;

const extractIntent = async (message, categories) => {
  const rawIntent = await generateContent(buildIntentPrompt(message, categories));

  const cleaned = rawIntent
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
};

// ==========================
// STEP 4 — Category mapping (safety net if the LLM still drifts)
// ==========================

const mapCategory = (intent, categories) => {
  if (!intent.category) return intent;

  const matchedCategory = categories.find(
    (cat) =>
      cat.toLowerCase() === intent.category.toLowerCase() ||
      cat.toLowerCase().includes(intent.category.toLowerCase()) ||
      intent.category.toLowerCase().includes(cat.toLowerCase())
  );

  if (matchedCategory) {
    intent.category = matchedCategory;
  }

  return intent;
};

// ==========================
// STEP 5 — Database search
// ==========================

const searchProviders = async (intent) => {
  const query = { verified: true };

  if (intent.category) {
    query.category = new RegExp(`^${intent.category}$`, "i");
  }

  if (intent.city) {
    query.city = new RegExp(`^${intent.city}$`, "i");
  }

  const providers = await ProviderProfile.find(query)
    .populate("userId", "name")
    .limit(10);

  if (intent.budget === "cheap") {
    providers.sort((a, b) => a.priceAmount - b.priceAmount);
  } else {
    providers.sort((a, b) => b.averageRating - a.averageRating);
  }

  return providers;
};

// ==========================
// STEP 6 — LLM response formatting
// ==========================

const formatProviderList = (providers) =>
  providers
    .map(
      (p) => `
Name: ${p.userId?.name || "Unknown"}

Category: ${p.category}

City: ${p.city}

Area: ${p.area}

Price: ₹${p.priceAmount}/${p.priceType}

Rating: ${p.averageRating}

Reviews: ${p.totalReviews}
`
    )
    .join("\n-------------------------\n");

const buildFinalPrompt = (message, providerList) => `
You are Handio AI Assistant.

The user asked:

"${message}"

These providers were found:

${providerList}

Reply naturally.

Requirements:

- Mention 3-5 providers.
- Mention price.
- Mention rating.
- Mention area.
- Recommend the best provider.
- If user asked for cheap, recommend the cheapest.
- Keep response under 120 words.
`;

// ==========================
// Controller
// ==========================

export const aiChat = async (req, res) => {
  try {
    const { message, history = [], lastProviders = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const lowerMessage = message.toLowerCase();
    const detectedAction = detectAction(lowerMessage);

    console.log("Detected Action:", detectedAction);

    // Explicit greeting -> skip everything else, show home chips
    if (isGreeting(lowerMessage)) {
      return res.json({
        success: true,
        reply: "Hello 👋 How can I help you today?",
        suggestions: getSuggestions({ stage: "greeting" }),
      });
    }

    // ==========================
    // SERVICE INTENT MATCHING
    // ==========================

    let detectedCategory = null;

    for (const [category, keywords] of Object.entries(serviceIntents)) {
      const matched = keywords.some((keyword) =>
        lowerMessage.includes(keyword.toLowerCase())
      );

      if (matched) {
        detectedCategory = category;
        break;
      }
    }

    // STEP 1 — Direct provider name search
    const allProviders = await ProviderProfile.find({ verified: true }).populate(
      "userId",
      "name"
    );

    const matchedProvider = findDirectProviderByName(allProviders, lowerMessage);

    if (matchedProvider) {
      if (detectedAction === "view_profile") {
        return res.json({
          success: true,
          action: "view_profile",
          provider: matchedProvider,
          reply: `Opening ${matchedProvider.userId.name}'s profile.`,
          suggestions: getSuggestions({ action: "view_profile" }),
        });
      }

      if (detectedAction === "book_provider") {
        return res.json({
          success: true,
          action: "book_provider",
          provider: matchedProvider,
          reply: `Booking ${matchedProvider.userId.name}.`,
          suggestions: getSuggestions({ action: "book_provider" }),
        });
      }
    }

    // STEP 2 — Follow-up actions
    const followUpResult = handleFollowUp(lowerMessage, lastProviders);

    if (followUpResult) {
      return res.json(followUpResult);
    }

    // STEP 3 — Intent extraction (categories fetched once, reused in step 4)
    const categories = await ProviderProfile.distinct("category");

    let intent = await extractIntent(message, categories);

    if (intent.intent !== "search_provider") {
      const reply = await generateContent(`
You are Handio AI Assistant.

Answer naturally and briefly.

User:
${message}
`);

      return res.json({
        success: true,
        reply,
        suggestions: getSuggestions({ stage: "general" }),
      });
    }

    // STEP 4 — Category mapping
    intent = mapCategory(intent, categories);

    // STEP 5 — Database search
    const providers = await searchProviders(intent);

    if (providers.length === 0) {
      const locationText = intent.city ? ` in ${intent.city}` : "";

      return res.json({
        success: true,
        reply: `Sorry, I couldn't find any verified ${intent.category || "matching"} providers${locationText}.`,
        providers: [],
        suggestions: getSuggestions({ stage: "no_results", category: intent.category }),
      });
    }

    // STEP 6 — LLM response formatting
    const providerList = formatProviderList(providers);
    const reply = await generateContent(buildFinalPrompt(message, providerList));

    return res.json({
      success: true,
      reply,
      providers,
      suggestions: getSuggestions({ providers, category: intent.category }),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};