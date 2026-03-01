// AI chat integration via Supabase Edge Functions (Anthropic).
// - chatOnboarding: onboarding flow with phase-based prompt switching (Sonnet 4.5)
// - chatTherapy: main therapy chat with Haiku routing + Sonnet response
// API keys are stored server-side — never exposed to the client.

import { supabase } from './supabase';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Onboarding chat: sends the full conversation history to the chat-onboarding
 * edge function, which determines the phase (einstellungs → problemfokus →
 * problemstellung → loesungsfokus → paywall → sales) based on the number of
 * user messages, fetches the right prompt from system_config, templates in the
 * therapist's name/personality, and calls Anthropic Sonnet 4.5.
 */
export async function chatOnboarding(
  message: string,
  therapistName: string,
  history: ChatMessage[] = []
): Promise<{ text: string; model: string; phase: string; userMessageCount: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('User must be logged in to chat.');
  }

  // Build messages array: history + current user message (no system prompt — the edge function handles that)
  const messages: ChatMessage[] = [
    ...history,
    { role: 'user', content: message },
  ];

  // Use AbortController with 90s timeout to prevent silent network timeouts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  let data: any;
  let error: any;
  try {
    const result = await supabase.functions.invoke('chat-onboarding', {
      body: { therapistName, messages },
      // @ts-ignore — signal is supported by fetch but not typed in supabase-js
      signal: controller.signal,
    });
    data = result.data;
    error = result.error;
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      throw new Error('Die Antwort hat zu lange gedauert. Bitte versuche es nochmal.');
    }
    throw e;
  }
  clearTimeout(timeoutId);

  if (error) {
    console.error('Onboarding proxy error:', error);
    throw new Error(`Onboarding AI request failed: ${error.message}`);
  }

  const text = data?.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response.';

  return {
    text: text.trim(),
    model: data?.model || 'claude-sonnet-4-5',
    phase: data?.phase || 'unknown',
    userMessageCount: data?.userMessageCount || 0,
  };
}

/**
 * Regular therapy chat with Haiku skill routing + Sonnet response.
 * Sends message + history to the therapy-router edge function, which:
 * 1. Uses Haiku to classify phase + safety needs from last 10 messages
 * 2. Fetches only the relevant skill prompt from system_config
 * 3. Calls Sonnet with focused prompt (main_prompt + character + active skill)
 * Returns the AI response + routing metadata.
 */
export async function chatTherapy(
  message: string,
  therapistName: string,
  history: ChatMessage[] = [],
  currentPhase: string = 'skill_problemfokus',
  isPro: boolean = false
): Promise<{ text: string; model: string; phase: string; safety: string | null; topic: string | null; hasMemory: boolean; zepContext: string | null; reminderCreated: boolean }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('User must be logged in to chat.');
  }

  const messages: ChatMessage[] = [
    ...history,
    { role: 'user', content: message },
  ];

  // Use AbortController with 90s timeout to prevent silent network timeouts
  // that cause truncated responses (e.g. message cut off at "Wie...")
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  let data: any;
  let error: any;
  try {
    const result = await supabase.functions.invoke('therapy-router', {
      body: { therapistName, messages, currentPhase, isPro },
      // @ts-ignore — signal is supported by fetch but not typed in supabase-js
      signal: controller.signal,
    });
    data = result.data;
    error = result.error;
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      throw new Error('Die Antwort hat zu lange gedauert. Bitte versuche es nochmal.');
    }
    throw e;
  }
  clearTimeout(timeoutId);

  if (error) {
    console.error('Therapy router error:', error);
    throw new Error(`Therapy AI request failed: ${error.message}`);
  }

  const text = data?.choices?.[0]?.message?.content
    || 'I apologize, but I was unable to generate a response.';

  return {
    text: text.trim(),
    model: data?.model || 'claude-sonnet-4-20250514',
    phase: data?.phase || 'unknown',
    safety: data?.safety || null,
    topic: data?.topic || null,
    hasMemory: data?.hasMemory || false,
    zepContext: data?.zepContext || null,
    reminderCreated: data?.reminderCreated || false,
  };
}
