/**
 * AI Provider Abstraction for FlavorNest.xyz Editorial Pipeline
 */

import { getCloudflareContext } from '@opennextjs/cloudflare';

export interface GenerateTextOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateStructuredOptions<T> {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  schemaDescription?: string;
  fallbackGenerator?: () => T;
}

export interface AIProvider {
  name: string;
  generateText(options: GenerateTextOptions): Promise<string>;
  generateStructuredContent<T>(options: GenerateStructuredOptions<T>): Promise<T>;
}

export class OpenAICompatibleProvider implements AIProvider {
  name = 'openai-compatible';
  private apiKey?: string;
  private endpoint: string;
  private model: string;

  constructor(apiKey?: string, endpoint = 'https://api.openai.com/v1', model = 'gpt-4o-mini') {
    this.apiKey = apiKey || getSecretKey('OPENAI_API_KEY');
    this.endpoint = endpoint;
    this.model = model;
  }

  async generateText(options: GenerateTextOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key is not configured for AI provider.');
    }

    const messages = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: options.userPrompt });

    const response = await fetch(`${this.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`AI API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async generateStructuredContent<T>(options: GenerateStructuredOptions<T>): Promise<T> {
    if (!this.apiKey && options.fallbackGenerator) {
      return options.fallbackGenerator();
    }

    const system = `${options.systemPrompt || ''}\n\nIMPORTANT: You must respond ONLY with valid JSON matching the requested structure. Do NOT include markdown code blocks or surrounding commentary.`;

    try {
      const raw = await this.generateText({
        systemPrompt: system,
        userPrompt: options.userPrompt,
        temperature: options.temperature ?? 0.4,
      });

      const cleanJson = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      return JSON.parse(cleanJson) as T;
    } catch (err) {
      console.warn('AI structured generation error, using fallback:', err);
      if (options.fallbackGenerator) {
        return options.fallbackGenerator();
      }
      throw new Error('Failed to parse AI structured response as valid JSON.');
    }
  }
}

export function getSecretKey(name: string): string | undefined {
  if (typeof process !== 'undefined' && process.env?.[name]) {
    return process.env[name];
  }
  try {
    const ctx = getCloudflareContext();
    if ((ctx?.env as any)?.[name]) return (ctx.env as any)[name] as string;
  } catch {}
  if (typeof globalThis !== 'undefined' && (globalThis as any)?.[name]) {
    return (globalThis as any)[name];
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any)?.env?.[name]) {
    return (globalThis as any)?.env?.[name];
  }
  return undefined;
}

/**
 * DeepSeek AI Provider (DeepSeek-V3 & DeepSeek-R1)
 * Ultra-fast & highly cost-effective ($0.14/1M tokens) for recipe rewriting and SEO generation
 */
export class DeepSeekProvider extends OpenAICompatibleProvider {
  constructor(apiKey?: string, model = 'deepseek-chat') {
    const key = apiKey || getSecretKey('DEEPSEEK_API_KEY');
    super(
      key,
      getSecretKey('DEEPSEEK_BASE_URL') || 'https://api.deepseek.com',
      model
    );
    this.name = 'deepseek';
  }
}

/**
 * Deterministic Mock AI Provider for testing and local development without API keys
 */
export class MockAIProvider implements AIProvider {
  name = 'deterministic-mock';

  async generateText(options: GenerateTextOptions): Promise<string> {
    return `Generated editorial copy based on prompt: ${options.userPrompt.slice(0, 100)}...`;
  }

  async generateStructuredContent<T>(options: GenerateStructuredOptions<T>): Promise<T> {
    if (options.fallbackGenerator) {
      return options.fallbackGenerator();
    }
    throw new Error('No fallback generator provided for Mock AI Provider.');
  }
}

export function getAIProvider(): AIProvider {
  const deepseekKey = getSecretKey('DEEPSEEK_API_KEY');
  if (deepseekKey) {
    return new DeepSeekProvider(deepseekKey);
  }
  const openaiKey = getSecretKey('OPENAI_API_KEY');
  if (openaiKey) {
    return new OpenAICompatibleProvider(openaiKey);
  }
  return new MockAIProvider();
}
