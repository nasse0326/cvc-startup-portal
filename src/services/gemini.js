export const getGeminiApiKey = () => {
  return localStorage.getItem('cvc_gemini_api_key') || '';
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
    throw new Error("Gemini API key is missing. Please set it in the Settings drawer.");
  }

  const model = "gemini-1.5-flash"; // Highly reliable, fast model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const startupName = startup?.name || "Unknown Startup";
  const startupSector = startup?.sector || "General";
  const startupStage = startup?.stage || "Unknown Stage";
  const startupTagline = startup?.tagline || "";

  const promptText = `
Startup Name: ${startupName}
Sector: ${startupSector}
Stage: ${startupStage}
Tagline: ${startupTagline}

Meeting Notes:
${notes}
`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: promptText
          }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        {
          text: `You are a professional CVC (Corporate Venture Capital) Investment Analyst. 
Analyze the provided meeting notes for the startup and generate a structured intelligence brief in Japanese.

You MUST extract and populate:
1. 'summary': An array of strings representing the core business model (exactly 1 to 3 items, clear and concise bullet points in Japanese).
2. 'strengths_and_bottlenecks': A detailed string explaining the tech/startup's immediate competitive advantages (strengths) and potential risk metrics or operational challenges (bottlenecks) in Japanese.
3. 'cvc_synergy': A detailed string detailing strategic collaboration, joint venture, co-development, cross-selling, or utilization opportunities for the corporate sponsor in Japanese.

Return ONLY a JSON object that conforms exactly to this schema. Do not add markdown wrappers (such as \`\`\`json ... \`\`\`), HTML elements, or notes outside the JSON.`
        }
      ]
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          summary: {
            type: "array",
            items: { type: "string" },
            description: "主要なビジネスモデルの要点（日本語で1〜3項目）"
          },
          strengths_and_bottlenecks: {
            type: "string",
            description: "スタートアップの強みおよび想定される課題・リスク（日本語）"
          },
          cvc_synergy: {
            type: "string",
            description: "出資側事業会社との具体的な協業案やシナジー創出の方向性（日本語）"
          }
        },
        required: ["summary", "strengths_and_bottlenecks", "cvc_synergy"]
      }
    }
  };

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
      throw new Error(`Gemini API Error: ${errMsg}`);
    }

    const resJson = await response.json();
    const candidateText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!candidateText) {
      throw new Error("Empty response received from Gemini model.");
    }

    try {
      const parsedBrief = JSON.parse(candidateText.trim());
      return parsedBrief;
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON:", candidateText);
      throw new Error("Failed to parse Gemini output as JSON schema. Please retry.");
    }
  } catch (error) {
    console.error("analyzeMeetingNotes error:", error);
    throw error;
  }
};
