/**
 * BharatCode API Client
 * Official Endpoint: https://bharatcode.ai/api/model/v1
 * Supported Models: qwen-3.8-27b, deepseek-v4.1-flash
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface BharatCodeConfig {
  apiKey?: string;
  apiBase?: string;
  model?: string;
}

export class BharatCodeClient {
  private apiKey: string;
  private apiBase: string;
  private model: string;

  constructor(config?: BharatCodeConfig) {
    this.apiKey =
      config?.apiKey ||
      process.env.BHARATCODE_API_KEY ||
      '';
    this.apiBase =
      config?.apiBase ||
      process.env.BHARATCODE_API_BASE ||
      'https://bharatcode.ai/api/model/v1';
    this.model =
      config?.model ||
      process.env.BHARATCODE_MODEL ||
      'qwen-3.8-27b';
  }

  public getModel(): string {
    return this.model;
  }

  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Send chat completion request to BharatCode API
   */
  async chatCompletion(
    messages: ChatMessage[],
    options?: {
      temperature?: number;
      responseFormat?: 'json_object' | 'text';
      maxTokens?: number;
    }
  ): Promise<string> {
    if (!this.hasApiKey()) {
      throw new Error(
        'BHARATCODE_API_KEY is not configured. Please set BHARATCODE_API_KEY in .env or pass it via CLI options.'
      );
    }

    const endpoint = `${this.apiBase.replace(/\/+$/, '')}/chat/completions`;
    const payload: Record<string, any> = {
      model: this.model,
      messages: messages,
      temperature: options?.temperature ?? 0.2,
      max_tokens: options?.maxTokens ?? 2048,
    };

    if (options?.responseFormat === 'json_object') {
      payload.response_format = { type: 'json_object' };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `BharatCode API error (${response.status} ${response.statusText}): ${errorText}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('BharatCode API returned an empty completion content.');
    }

    return content;
  }

  /**
   * Helper to parse JSON from model output safely even if wrapped in markdown fences
   */
  public static extractJSON<T = any>(rawText: string): T {
    let clean = rawText.trim();
    // Remove ```json ... ``` wrapper if present
    const markdownMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (markdownMatch && markdownMatch[1]) {
      clean = markdownMatch[1].trim();
    }
    return JSON.parse(clean);
  }
}
