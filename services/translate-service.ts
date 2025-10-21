import { Alert } from "react-native";

export interface TranslationResult {
  original: string;
  translated: string;
}

// const API_URL = "https://api/translate";

export const translateWord = async (
  word: string,
  fullText?: string
): Promise<TranslationResult | null> => {
  if (!word.trim()) return null;

  try {
    //TEMP MOCK RETURN:
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return {
      original: word,
      translated: "<PLACEHOLDER>",
    };

    // const response = await fetch(API_URL, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     text: word,
    //     context: fullText, // optional context to improve translation accuracy
    //   }),
    // });

    // if (!response.ok) {
    //   console.error("Translation API error:", await response.text());
    //   throw new Error("Failed to fetch translation");
    // }

    // const data = await response.json();

    // return {
    //   original: word,
    //   translated: data.translatedText || "(no translation)",
    //   detectedLanguage: data.detectedSourceLanguage,
    // };
  } catch (error) {
    console.error("Error translating word:", error);
    Alert.alert("Erro", "Ocorreu um erro ao traduzir o texto selecionado.");
    return null;
  }
};
