// AI chat integration via Supabase Edge Functions.
// - chatWithAgent: general therapy chat (via together-proxy → Anthropic)
// - chatOnboarding: onboarding flow with phase-based prompt switching (via chat-onboarding → Anthropic Sonnet 4.5)
// API keys are stored server-side — never exposed to the client.

import { supabase } from './supabase';

// Default model: MiniMax-M2.5
const DEFAULT_MODEL = 'MiniMaxAI/MiniMax-M2.5';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1024;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AgentConfig {
  name: string;
  systemPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function chatWithAgent(
  message: string,
  agent: AgentConfig,
  history: ChatMessage[] = []
): Promise<{ text: string; model: string }> {
  const messages: ChatMessage[] = [
    { role: 'system', content: agent.systemPrompt },
    ...history,
    { role: 'user', content: message },
  ];

  const model = agent.model || DEFAULT_MODEL;

  // Get the current session token for auth
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  if (!accessToken) {
    throw new Error('User must be logged in to chat.');
  }

  // Call the Supabase Edge Function (proxies to Together AI)
  const { data, error } = await supabase.functions.invoke('together-proxy', {
    body: {
      model,
      messages,
      temperature: agent.temperature ?? DEFAULT_TEMPERATURE,
      max_tokens: agent.maxTokens ?? DEFAULT_MAX_TOKENS,
      top_p: 0.9,
    },
  });

  if (error) {
    console.error('Together proxy error:', error);
    throw new Error(`AI request failed: ${error.message}`);
  }

  const text = data?.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response.';

  return {
    text: text.trim(),
    model: data?.model || model,
  };
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

  const { data, error } = await supabase.functions.invoke('chat-onboarding', {
    body: { therapistName, messages },
  });

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

// Test function - can call directly from browser console
export async function testAgent(agentName: string, message: string): Promise<void> {
  try {
    const { text } = await chatWithAgent(message, {
      name: agentName,
      systemPrompt: `You are ${agentName}, an AI mental health companion.`,
    });
    console.log(`${agentName} responded successfully.`);
  } catch (err) {
    console.error('Test failed:', err);
  }
}
