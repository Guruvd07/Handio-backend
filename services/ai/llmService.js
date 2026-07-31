import Groq from "groq-sdk";

console.log("========== LLM SERVICE LOADED ==========");
console.log("GROQ KEY EXISTS:", !!process.env.GROQ_API_KEY);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateContent = async (prompt) => {
  console.log("generateContent() called");

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return completion.choices[0].message.content;
};