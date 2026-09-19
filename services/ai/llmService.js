import Groq from "groq-sdk";

console.log("========== LLM SERVICE LOADED ==========");
console.log("GROQ KEY EXISTS:", !!process.env.GROQ_API_KEY);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL_NAME =
  process.env.GROQ_MODEL || "openai/gpt-oss-120b";

export const generateContent = async (prompt) => {
  try {
    console.log("========== generateContent() ==========");
    console.log("Using model:", MODEL_NAME);
    console.log(prompt);

    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    console.log("✅ Groq Success");

    return completion.choices[0].message.content;

  } catch (error) {
    console.error("❌ GROQ ERROR");
    console.error("Status:", error.status);
    console.error("Message:", error.message);

    throw error;
  }
};