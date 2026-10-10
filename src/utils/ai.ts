import { generateId, nowISO } from './storage';
import type { AICoachSuggestion } from './types';

const AI_USAGE_KEY = 'smartstudyos_ai_usage';
const DAILY_LIMIT = 20;

interface AIUsage {
  date: string;
  count: number;
}

function getUsage(): AIUsage {
  try {
    const raw = localStorage.getItem(AI_USAGE_KEY);
    if (!raw) return { date: new Date().toISOString().split('T')[0], count: 0 };
    const usage = JSON.parse(raw) as AIUsage;
    const today = new Date().toISOString().split('T')[0];
    if (usage.date !== today) return { date: today, count: 0 };
    return usage;
  } catch {
    return { date: new Date().toISOString().split('T')[0], count: 0 };
  }
}

function incrementUsage(): void {
  const usage = getUsage();
  usage.count++;
  localStorage.setItem(AI_USAGE_KEY, JSON.stringify(usage));
}

export function canUseAI(): { allowed: boolean; remaining: number } {
  const usage = getUsage();
  return { allowed: usage.count < DAILY_LIMIT, remaining: DAILY_LIMIT - usage.count };
}

export function getAIUsageCount(): number {
  return getUsage().count;
}

export async function askGemini(
  prompt: string,
  context: string
): Promise<{ success: boolean; response?: string; error?: string }> {
  const apiKey = localStorage.getItem('smartstudyos_gemini_key');
  if (!apiKey) {
    return { success: false, error: 'No API key configured. Add one in Settings.' };
  }

  const check = canUseAI();
  if (!check.allowed) {
    return { success: false, error: `Daily limit reached (${DAILY_LIMIT} requests/day). Try again tomorrow.` };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful AI study coach embedded in Smart StudyOS, a study productivity app. Be concise, practical, and encouraging. Keep responses under 3 sentences.\n\nStudent context: ${context}\n\nStudent question: ${prompt}`,
            }],
          }],
          generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
        }),
      }
    );

    if (!response.ok) {
      let errorMsg = `API error (${response.status})`;

      if (response.status === 400) {
        errorMsg = 'Invalid API key. Please check your key in Settings.';
      } else if (response.status === 403) {
        errorMsg = 'API key does not have permission. Enable the Gemini API in Google AI Studio.';
      } else if (response.status === 429) {
        errorMsg = 'Rate limited. Wait a moment and try again.';
      } else if (response.status === 404) {
        errorMsg = 'API endpoint not found. Your key may be invalid.';
      }

      return { success: false, error: errorMsg };
    }

    const data = await response.json();

    if (data.error) {
      return { success: false, error: data.error.message || 'API returned an error' };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      if (data.candidates?.[0]?.finishReason === 'SAFETY') {
        return { success: false, error: 'Response blocked by safety filters. Try a different question.' };
      }
      return { success: false, error: 'No response generated. Try again.' };
    }

    incrementUsage();
    return { success: true, response: text };
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      return { success: false, error: 'Network error. Check your internet connection.' };
    }
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

export function createAISuggestion(message: string, type: AICoachSuggestion['type'] = 'tip'): AICoachSuggestion {
  return {
    id: generateId(),
    message,
    type,
    timestamp: nowISO(),
    dismissed: false,
  };
}
