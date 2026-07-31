import Groq from "groq-sdk";

console.log("========== LLM SERVICE LOADED ==========");
console.log("GROQ KEY EXISTS:", !!process.env.GROQ_API_KEY);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateContent = async (prompt) => {
  try {
    console.log("========== generateContent() ==========");
    console.log(prompt);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
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
    console.error(error);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }

    console.error("Message:", error.message);

    throw error;
  }
};