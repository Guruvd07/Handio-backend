import ProviderProfile from "../models/ProviderProfile.js";
import { generateContent } from "../services/ai/llmService.js";

export const aiSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    // Get all available categories from database
    const categories = await ProviderProfile.distinct("category");

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No service categories found.",
      });
    }

    const prompt = `
You are an AI assistant for Handio, a service marketplace.

Your task is to classify the user's request into EXACTLY ONE category.

AVAILABLE CATEGORIES:
${categories.map((c) => `- ${c}`).join("\n")}

IMPORTANT RULES:
1. Choose ONLY ONE category from the list above.
2. Never invent a new category.
3. Never guess.
4. If none of the categories match the request, return:
{
  "category": null,
  "confidence": 0
}
5. Return ONLY raw JSON.
6. Do NOT explain anything.
7. Do NOT use markdown.
8. Do NOT wrap JSON inside \`\`\`.

Examples:

User: "My AC is not cooling"
{
  "category": "AC Repair",
  "confidence": 0.98
}

User: "Pipe is leaking"
{
  "category": "Plumber",
  "confidence": 0.99
}

User: "I need a home tutor"
{
  "category": null,
  "confidence": 0
}

Now classify:

"${query}"
`;

    const aiResponse = await generateContent(prompt);

    console.log("\n========== RAW AI RESPONSE ==========");
    console.log(aiResponse);
    console.log("=====================================\n");

    const cleanedResponse = aiResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsedResponse;

    try {
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (err) {
      console.error("JSON Parse Error:", err);

      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON.",
        rawResponse: aiResponse,
      });
    }

    // AI could not confidently classify
    if (
      !parsedResponse.category ||
      parsedResponse.confidence < 0.8
    ) {
      return res.json({
        success: true,
        userQuery: query,
        ai: parsedResponse,
        totalProviders: 0,
        providers: [],
        message: "No matching service found.",
      });
    }

    // Search providers
    const providers = await ProviderProfile.find({
      category: parsedResponse.category,
      verified: true,
    })
      .populate("userId", "name email")
      .sort({
        averageRating: -1,
      });

    // No providers in that category
    if (providers.length === 0) {
      return res.json({
        success: true,
        userQuery: query,
        ai: parsedResponse,
        totalProviders: 0,
        providers: [],
        message: `No providers available for "${parsedResponse.category}".`,
      });
    }

    return res.json({
      success: true,
      userQuery: query,
      ai: parsedResponse,
      totalProviders: providers.length,
      providers,
    });

  } catch (error) {
    console.error("AI Search Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};