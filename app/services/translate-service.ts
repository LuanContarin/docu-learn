import { fetch } from "expo/fetch";
import { Alert } from "react-native";

export interface TranslationResult {
  original_text: string;
  translated_text: string;
}

const URL_API = "http://localhost:8000";

export const translateText = async (
  text: string
): Promise<TranslationResult | null> => {
  if (!text.trim()) return null;

  try {
    const response = await fetch(`${URL_API}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.error("Translation API error:", await response.text());
      throw new Error("Failed to fetch translation");
    }

    const data = await response.json();

    return {
      original_text: data?.original_text,
      translated_text: data?.translated_text || "(sem tradução)",
    };
  } catch (err) {
    console.error(err);
    Alert.alert("Erro", "Ocorreu um erro ao traduzir o texto selecionado.");
    return null;
  }
};
