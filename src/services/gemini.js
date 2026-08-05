export const getGeminiApiKey = () => {
  return localStorage.getItem('cvc_gemini_api_key') || (import.meta.env.VITE_GEMINI_API_KEY || '');
};

export const saveGeminiApiKey = (key) => {
  if (key) {
    localStorage.setItem('cvc_gemini_api_key', key);
  } else {
    localStorage.removeItem('cvc_gemini_api_key');
  }
};

export const analyzeMeetingNotes = async (notes, startup) => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini APIキーが設定されていません。ヘッダーの ⚙️「設定」画面から Gemini API Key を保存してください。");
  }

  const candidateEndpoints = [
    { apiVersion: 'v1beta', model: 'gemini-2.5-flash' },
    { apiVersion: 'v1beta', model: 'gemini-2.0-flash' },
    { apiVersion: 'v1', model: 'gemini-1.5-flash' },
    { apiVersion: 'v1beta', model: 'gemini-1.5-flash-latest' }
  ];

  const startupName = startup?.name || "Unknown Startup";
  const startupSector = startup?.sector || "General";
  const startupStage = startup?.stage || "Unknown Stage";
  const startupTagline = startup?.tagline || "";

  const promptText = `You are a professional CVC (Corporate Venture Capital) Investment Analyst. 
Analyze the provided meeting notes for the startup and generate a structured intelligence brief in Japanese.

Startup Name: ${startupName}
Sector: ${startupSector}
Stage: ${startupStage}
Tagline: ${startupTagline}

Meeting Notes:
${notes}

You MUST return ONLY a raw JSON object (with NO markdown code blocks, NO \`\`\`json wrappers, NO HTML).
The JSON MUST follow this exact structure:
{
  "summary": ["要点1", "要点2", "要点3"],
  "strengths_and_bottlenecks": "強み・競争優位性および想定される課題・リスクの分析（日本語）",
  "cvc_synergy": "出資側事業会社との具体的な協業案やシナジー創出の方向性（日本語）"
}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: promptText }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2
    }
  };

  let lastError = null;

  for (const { apiVersion, model } of candidateEndpoints) {
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData?.error?.message || `HTTP ${response.status} Error`;
        lastError = new Error(`Gemini API Error (${model} / ${apiVersion}): ${errMsg}`);
        console.warn(`Endpoint ${apiVersion}/${model} failed, trying next...`, errMsg);
        continue;
      }

      const resJson = await response.json();
      const rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!rawText) {
        lastError = new Error(`Empty response received from ${model}.`);
        continue;
      }

      // Clean up markdown block if model adds ```json ... ```
      const cleanedJsonText = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      try {
        const parsedBrief = JSON.parse(cleanedJsonText);
        if (parsedBrief && parsedBrief.summary && parsedBrief.cvc_synergy) {
          return parsedBrief;
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON output:", rawText);
        lastError = new Error("Gemini出力のJSONパースに失敗しました。");
        continue;
      }
    } catch (err) {
      console.error(`Error requesting ${apiVersion}/${model}:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("Gemini APIとの通信に失敗しました。APIキー（無料枠有効）と接続をご確認ください。");
};
