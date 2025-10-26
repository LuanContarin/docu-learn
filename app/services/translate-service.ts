import { Alert } from "react-native";

export interface TranslationResult {
  original: string;
  translated: string;
}

const URL_API = "http://localhost:5000";

export const translateText = async (
  text: string
): Promise<TranslationResult | null> => {
  if (!text.trim()) return null;

  try {
    const response = await fetch(`${URL_API}/traduzir`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        texto: text,
      }),
    });

    if (!response.ok) {
      console.error("Translation API error:", await response.text());
      throw new Error("Failed to fetch translation");
    }

    const data = await response.json();

    return {
      original: data?.texto_original,
      translated: data?.texto_traduzido || "(sem tradução)",
    };
  } catch (err) {
    console.error(err);
    Alert.alert("Erro", "Ocorreu um erro ao traduzir o texto selecionado.");
    return null;
  }
};
