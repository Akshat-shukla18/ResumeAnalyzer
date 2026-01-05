import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const API_KEY = "YOUR_GOOGLE_API_KEY_HERE";



const MODEL_NAME = "models/gemini-1.5-flash"; // ✅ Verified working model

const genAI = new GoogleGenerativeAI(API_KEY);

async function runChat(prompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
      ],
    });

    let modifiedPrompt = prompt;
    if (prompt.startsWith("You are an ATS resume analyzer.")) {
      modifiedPrompt = "You are an expert resume analyzer. Provide ATS score and improvement suggestions.\n\n" + prompt;
    }

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(modifiedPrompt);
    const response = await result.response.text();
    return response;
  } catch (error) {
    console.error("❌ Gemini API Error:", error.response || error.message || error);
    return "⚠ Gemini API failed. Please try again.";
  }
}

export default runChat;
