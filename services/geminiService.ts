import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { UserSession } from "../types";

// --- Google Gemini Implementation ---
const getGoogleClient = (apiKeyOverride?: string) => {
  const apiKey = apiKeyOverride || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing for Google Provider.");
  }
  return new GoogleGenAI({ apiKey });
};

const analyzeWithGoogle = async (content: string, mimeType: string, session: UserSession): Promise<string> => {
  const ai = getGoogleClient(session.apiKey);
  const modelId = session.customModel || 'gemini-2.5-flash';

  const isText = mimeType.startsWith('text/');
  
  const parts = isText 
    ? [{ inlineData: { mimeType, data: content } }] 
    : [{ inlineData: { mimeType, data: content } }];

  const response = await ai.models.generateContent({
    model: modelId,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
    },
    contents: { parts }
  });

  if (!response.text) {
    throw new Error("No response received from Gemini.");
  }
  return response.text;
};

// --- Generic OpenAI Compatible Implementation (OpenAI, Mistral, Groq, Local, etc.) ---
const analyzeWithOpenAICompatible = async (content: string, mimeType: string, session: UserSession): Promise<string> => {
  // Most OpenAI compatible endpoints (and OpenAI itself) do not support PDF upload via chat completions directly
  // unless using specific file assistant APIs which are complex to implement client-side without a backend.
  // We will restrict this to text-based inputs for now or require the user to paste text.
  if (mimeType === 'application/pdf') {
    throw new Error("PDF analysis is currently only supported with Google Gemini. Please upload a Text/Markdown file for this provider.");
  }

  // Decode base64 content to string for text models
  let textContent = '';
  try {
    textContent = atob(content);
  } catch (e) {
    throw new Error("Failed to decode file content.");
  }

  const baseUrl = session.baseUrl || 'https://api.openai.com/v1';
  const apiKey = session.apiKey || ''; // Local models might not need it
  const model = session.customModel || 'gpt-4o';
  
  // Construct URL - handle potential trailing slash issues
  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add auth header if key exists or if provider is not local (though some local need 'Bearer something')
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const payload = {
    model: model,
    messages: [
      { role: "system", content: SYSTEM_INSTRUCTION },
      { role: "user", content: textContent }
    ],
    temperature: 0.2
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Provider Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const result = data.choices?.[0]?.message?.content;

  if (!result) {
    throw new Error("No content received from provider.");
  }

  return result;
};

// --- Anthropic Implementation ---
const analyzeWithAnthropic = async (content: string, mimeType: string, session: UserSession): Promise<string> => {
   if (mimeType === 'application/pdf') {
    throw new Error("PDF analysis is currently only supported with Google Gemini. Please upload a Text/Markdown file.");
  }

  let textContent = atob(content);
  const baseUrl = session.baseUrl || 'https://api.anthropic.com/v1';
  const apiKey = session.apiKey;

  if (!apiKey) throw new Error("API Key required for Anthropic.");

  const url = `${baseUrl.replace(/\/$/, '')}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'dangerous-allow-browser-cors': 'true' // Required for client-side direct calls if supported by proxy
    },
    body: JSON.stringify({
      model: session.customModel || 'claude-3-5-sonnet-20240620',
      max_tokens: 4096,
      system: SYSTEM_INSTRUCTION,
      messages: [
        { role: "user", content: textContent }
      ]
    })
  });

  if (!response.ok) {
     const errText = await response.text();
     throw new Error(`Anthropic Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const result = data.content?.[0]?.text;

  if (!result) throw new Error("No text content in Anthropic response");
  return result;
};


/**
 * Main Analysis Function
 */
export const analyzeSOW = async (content: string, mimeType: string, session?: UserSession): Promise<string> => {
  if (!session) {
    // Default fallback to Google if no session (shouldn't happen in this flow)
    return analyzeWithGoogle(content, mimeType, { name: 'Guest', provider: 'google' });
  }

  try {
    switch (session.provider) {
      case 'google':
        return await analyzeWithGoogle(content, mimeType, session);
      
      case 'anthropic':
        return await analyzeWithAnthropic(content, mimeType, session);

      case 'openai':
      case 'mistral':
      case 'deepseek':
      case 'groq':
      case 'local':
      case 'custom':
        return await analyzeWithOpenAICompatible(content, mimeType, session);
      
      default:
        throw new Error(`Provider ${session.provider} is not implemented.`);
    }
  } catch (error) {
    console.error("Analysis Error:", error);
    if (error instanceof Error) {
        throw new Error(`Analysis failed: ${error.message}`);
    }
    throw new Error("An unexpected error occurred during analysis.");
  }
};