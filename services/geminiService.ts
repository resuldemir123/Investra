
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithBackoff<T,>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      console.warn(`Attempt ${i + 1} failed, retrying in ${delay}ms...`, error);
      await sleep(delay);
      delay *= 2;
    }
  }
  throw new Error("Max retries reached");
}

export const analyzeStartup = async (summary: string): Promise<AnalysisResult> => {
  return fetchWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: `Sen profesyonel bir Venture Capital (VC) analisti ve stratejistisin. Aşağıdaki girişim özetini derinlemesine analiz et ve akademik frameworkleri (SWOT, Unit Economics, PESTEL) kullanarak yapılandırılmış bir rapor sun:
      
      "${summary}"
      
      Yanıtı sadece bu JSON formatında ver:
      {
        "executiveSummary": "Yatırımcı tezi ve kısa özet",
        "valuationRange": "Tahmini değerleme aralığı (Dolar bazında)",
        "burnRateFactor": "Optimize Edilmiş / Riskli / Verimli",
        "tam2025": "Hedef pazar büyüklüğü",
        "scores": {
          "market": 0-100,
          "team": 0-100,
          "product": 0-100,
          "finance": 0-100
        },
        "industryAverage": {
          "market": 0-100,
          "team": 0-100,
          "product": 0-100,
          "finance": 0-100
        },
        "growthProjections": [
          {"year": "2025", "marketSize": "Değer"},
          {"year": "2026", "marketSize": "Değer"},
          {"year": "2027", "marketSize": "Değer"},
          {"year": "2028", "marketSize": "Değer"},
          {"year": "2029", "marketSize": "Değer"}
        ],
        "swot": {
          "strengths": ["Güçlü yön 1", "Güçlü yön 2"],
          "weaknesses": ["Zayıf yön 1", "Zayıf yön 2"],
          "opportunities": ["Fırsat 1", "Fırsat 2"],
          "threats": ["Tehdit 1", "Tehdit 2"]
        },
        "unitEconomics": {
          "cac": "Müşteri Edinme Maliyeti Tahmini",
          "ltv": "Müşteri Yaşam Boyu Değeri Tahmini",
          "payback": "Geri Dönüş Süresi",
          "ratio": "LTV/CAC Oranı Tahmini"
        },
        "strategicAdvice": ["Stratejik öneri 1", "Stratejik öneri 2"]
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(response.text || '{}');
    return data as AnalysisResult;
  });
};
