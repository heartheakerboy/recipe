/**
 * Image Generation Provider Abstraction for FlavorNest.xyz
 */

import { getSecretKey } from '../ai/ai-provider';

export type AspectRatio = '1:1' | '4:3' | '3:2' | '16:9' | '2:3' | '9:16';

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  stylePreset?: string;
  seed?: number;
}

export interface ImageGenerationResponse {
  success: boolean;
  jobId: string;
  status: 'completed' | 'generating' | 'failed';
  imageUrl?: string;
  width: number;
  height: number;
  format: 'webp' | 'png' | 'jpeg';
  provider: string;
  model: string;
  durationMs: number;
  error?: string;
}

export interface ImageGenerationStatus {
  jobId: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  progress?: number;
  imageUrl?: string;
  error?: string;
}

export interface ImageGenerationProvider {
  name: string;
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
  getGenerationStatus(jobId: string): Promise<ImageGenerationStatus>;
  cancelGeneration?(jobId: string): Promise<boolean>;
}

/**
 * Universal FLUX.1 API Provider
 * Supports:
 * 1. Black Forest Labs official API (api.bfl.ml) with automated result polling
 * 2. Together.ai (api.together.xyz)
 * 3. Fal.ai (fal.run)
 * 4. OpenAI / DeepInfra / SiliconFlow image generation endpoints
 */
export class FluxImageProvider implements ImageGenerationProvider {
  name = 'flux-api';
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private timeoutMs: number;

  constructor(
    apiKey?: string,
    baseUrl?: string,
    model?: string,
    timeoutMs = 60000
  ) {
    this.apiKey = apiKey || getSecretKey('FLUX_API_KEY') || '';
    this.baseUrl = baseUrl || getSecretKey('FLUX_API_BASE_URL') || process.env.FLUX_API_BASE_URL || 'https://api.bfl.ml/v1';
    this.model = model || getSecretKey('FLUX_MODEL') || process.env.FLUX_MODEL || 'flux-pro-1.1';
    this.timeoutMs = timeoutMs;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now();
    if (!this.apiKey) {
      return {
        success: false,
        jobId: `flux_err_${Date.now()}`,
        status: 'failed',
        width: request.width,
        height: request.height,
        format: 'jpeg',
        provider: this.name,
        model: this.model,
        durationMs: 0,
        error: 'FLUX_API_KEY is not configured in Cloudflare secrets / environment variables.',
      };
    }

    try {
      // 1. Check if provider is Together AI
      if (this.baseUrl.includes('together.xyz') || this.baseUrl.includes('/images/generations')) {
        return await this.generateTogetherOrOpenAI(request, startTime);
      }

      // 2. Check if provider is Fal AI
      if (this.baseUrl.includes('fal.run') || this.baseUrl.includes('fal.ai')) {
        return await this.generateFalAi(request, startTime);
      }

      // 3. Default: Black Forest Labs (BFL) API with Polling
      return await this.generateBlackForestLabs(request, startTime);
    } catch (error: any) {
      console.error('FLUX Generation Exception:', error);
      return {
        success: false,
        jobId: `flux_err_${Date.now()}`,
        status: 'failed',
        width: request.width,
        height: request.height,
        format: 'jpeg',
        provider: this.name,
        model: this.model,
        durationMs: Date.now() - startTime,
        error: error.message || 'FLUX generation request failed',
      };
    }
  }

  /**
   * Black Forest Labs (BFL) Official API
   */
  private async generateBlackForestLabs(request: ImageGenerationRequest, startTime: number): Promise<ImageGenerationResponse> {
    const endpoint = this.model.includes('schnell')
      ? `${this.baseUrl}/flux-schnell`
      : this.model.includes('dev')
      ? `${this.baseUrl}/flux-dev`
      : `${this.baseUrl}/flux-pro-1.1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const initRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Key': this.apiKey,
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        prompt: request.prompt,
        width: Math.min(1440, Math.max(256, request.width - (request.width % 32))),
        height: Math.min(1440, Math.max(256, request.height - (request.height % 32))),
        prompt_upsampling: true,
        seed: request.seed,
        safety_tolerance: 2,
        output_format: 'jpeg',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!initRes.ok) {
      const errorText = await initRes.text();
      return {
        success: false,
        jobId: `flux_err_${Date.now()}`,
        status: 'failed',
        width: request.width,
        height: request.height,
        format: 'jpeg',
        provider: this.name,
        model: this.model,
        durationMs: Date.now() - startTime,
        error: `BFL FLUX API Error (${initRes.status}): ${errorText}`,
      };
    }

    const initData: any = await initRes.json();
    const jobId = initData.id || initData.task_id;

    if (!jobId) {
      if (initData.result?.sample || initData.image_url) {
        return {
          success: true,
          jobId: `flux_${Date.now()}`,
          status: 'completed',
          imageUrl: initData.result?.sample || initData.image_url,
          width: request.width,
          height: request.height,
          format: 'jpeg',
          provider: this.name,
          model: this.model,
          durationMs: Date.now() - startTime,
        };
      }
      return {
        success: false,
        jobId: `flux_err_${Date.now()}`,
        status: 'failed',
        width: request.width,
        height: request.height,
        format: 'jpeg',
        provider: this.name,
        model: this.model,
        durationMs: Date.now() - startTime,
        error: 'No task ID returned by FLUX API.',
      };
    }

    // Polling Loop for BFL API until image is Ready (max 45 seconds)
    const pollDeadline = Date.now() + 45000;
    while (Date.now() < pollDeadline) {
      await this.sleep(2000);

      try {
        const pollRes = await fetch(`${this.baseUrl}/get_result?id=${jobId}`, {
          method: 'GET',
          headers: {
            'X-Key': this.apiKey,
            Authorization: `Bearer ${this.apiKey}`,
          },
        });

        if (pollRes.ok) {
          const pollData: any = await pollRes.json();
          if (pollData.status === 'Ready' && pollData.result?.sample) {
            return {
              success: true,
              jobId,
              status: 'completed',
              imageUrl: pollData.result.sample,
              width: request.width,
              height: request.height,
              format: 'jpeg',
              provider: this.name,
              model: this.model,
              durationMs: Date.now() - startTime,
            };
          }

          if (pollData.status === 'Failed' || pollData.status === 'Error') {
            return {
              success: false,
              jobId,
              status: 'failed',
              width: request.width,
              height: request.height,
              format: 'jpeg',
              provider: this.name,
              model: this.model,
              durationMs: Date.now() - startTime,
              error: pollData.error || 'FLUX generation failed on BFL server.',
            };
          }
        }
      } catch (pollErr: any) {
        console.warn('FLUX polling attempt failed:', pollErr.message);
      }
    }

    return {
      success: false,
      jobId,
      status: 'failed',
      width: request.width,
      height: request.height,
      format: 'jpeg',
      provider: this.name,
      model: this.model,
      durationMs: Date.now() - startTime,
      error: 'FLUX image generation timed out while waiting for BFL server to render.',
    };
  }

  /**
   * Together.ai or OpenAI-Compatible Image API
   */
  private async generateTogetherOrOpenAI(request: ImageGenerationRequest, startTime: number): Promise<ImageGenerationResponse> {
    const endpoint = this.baseUrl.endsWith('/images/generations')
      ? this.baseUrl
      : `${this.baseUrl}/images/generations`;

    const modelName = this.model || 'black-forest-labs/FLUX.1-schnell';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        prompt: request.prompt,
        width: request.width,
        height: request.height,
        steps: 4,
        n: 1,
        response_format: 'url',
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        jobId: `flux_err_${Date.now()}`,
        status: 'failed',
        width: request.width,
        height: request.height,
        format: 'jpeg',
        provider: this.name,
        model: this.model,
        durationMs: Date.now() - startTime,
        error: `Together/OpenAI FLUX Error (${res.status}): ${errText}`,
      };
    }

    const data: any = await res.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      return {
        success: false,
        jobId: `flux_err_${Date.now()}`,
        status: 'failed',
        width: request.width,
        height: request.height,
        format: 'jpeg',
        provider: this.name,
        model: this.model,
        durationMs: Date.now() - startTime,
        error: 'No image URL returned in response data.',
      };
    }

    return {
      success: true,
      jobId: `flux_${Date.now()}`,
      status: 'completed',
      imageUrl,
      width: request.width,
      height: request.height,
      format: 'jpeg',
      provider: this.name,
      model: this.model,
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * Fal.ai Image API
   */
  private async generateFalAi(request: ImageGenerationRequest, startTime: number): Promise<ImageGenerationResponse> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${this.apiKey}`,
      },
      body: JSON.stringify({
        prompt: request.prompt,
        image_size: {
          width: request.width,
          height: request.height,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        jobId: `flux_err_${Date.now()}`,
        status: 'failed',
        width: request.width,
        height: request.height,
        format: 'jpeg',
        provider: this.name,
        model: this.model,
        durationMs: Date.now() - startTime,
        error: `Fal.ai FLUX Error (${res.status}): ${errText}`,
      };
    }

    const data: any = await res.json();
    const imageUrl = data.images?.[0]?.url || data.image?.url;

    if (!imageUrl) {
      return {
        success: false,
        jobId: `flux_err_${Date.now()}`,
        status: 'failed',
        width: request.width,
        height: request.height,
        format: 'jpeg',
        provider: this.name,
        model: this.model,
        durationMs: Date.now() - startTime,
        error: 'No image URL found in Fal.ai response.',
      };
    }

    return {
      success: true,
      jobId: `flux_${Date.now()}`,
      status: 'completed',
      imageUrl,
      width: request.width,
      height: request.height,
      format: 'jpeg',
      provider: this.name,
      model: this.model,
      durationMs: Date.now() - startTime,
    };
  }

  async getGenerationStatus(jobId: string): Promise<ImageGenerationStatus> {
    if (!this.apiKey) {
      return { jobId, status: 'failed', error: 'Missing FLUX API Key' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/get_result?id=${jobId}`, {
        method: 'GET',
        headers: {
          'X-Key': this.apiKey,
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        return { jobId, status: 'failed', error: `Status check error (${response.status})` };
      }

      const data = await response.json();
      if (data.status === 'Ready' && data.result?.sample) {
        return {
          jobId,
          status: 'completed',
          imageUrl: data.result.sample,
          progress: 100,
        };
      } else if (data.status === 'Pending' || data.status === 'Processing') {
        return {
          jobId,
          status: 'generating',
          progress: data.progress || 50,
        };
      }

      return {
        jobId,
        status: 'failed',
        error: data.error || 'Generation failed on provider',
      };
    } catch (error: any) {
      return {
        jobId,
        status: 'failed',
        error: error.message || 'Status fetch failed',
      };
    }
  }
}

/**
 * Deterministic Mock Image Provider with high-resolution food assets for zero-cost offline & testing workflows
 */
export class MockImageProvider implements ImageGenerationProvider {
  name = 'deterministic-mock-flux';

  private mockLibrary: Record<string, string> = {
    chicken: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80',
    pasta: 'https://images.unsplash.com/photo-1621996346565-e3d5d628169b?auto=format&fit=crop&w=1200&q=80',
    wings: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=1200&q=80',
    salmon: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
    beef: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    potatoes: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80',
    pancakes: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200&q=80',
    soup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80',
    dessert: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=1200&q=80',
    pinterest: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&h=1500&q=80',
  };

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const p = request.prompt.toLowerCase();
    let sample = this.mockLibrary.chicken;

    if (request.aspectRatio === '2:3') sample = this.mockLibrary.pinterest;
    else if (p.includes('pasta') || p.includes('gnocchi')) sample = this.mockLibrary.pasta;
    else if (p.includes('wing')) sample = this.mockLibrary.wings;
    else if (p.includes('salmon') || p.includes('shrimp')) sample = this.mockLibrary.salmon;
    else if (p.includes('beef') || p.includes('roast')) sample = this.mockLibrary.beef;
    else if (p.includes('potato')) sample = this.mockLibrary.potatoes;
    else if (p.includes('pancake') || p.includes('breakfast')) sample = this.mockLibrary.pancakes;
    else if (p.includes('soup')) sample = this.mockLibrary.soup;
    else if (p.includes('apple') || p.includes('crisp') || p.includes('dessert')) sample = this.mockLibrary.dessert;

    return {
      success: true,
      jobId: `mock_flux_${Date.now()}`,
      status: 'completed',
      imageUrl: sample,
      width: request.width,
      height: request.height,
      format: 'webp',
      provider: this.name,
      model: 'flux-1-schnell-mock',
      durationMs: 850,
    };
  }

  async getGenerationStatus(jobId: string): Promise<ImageGenerationStatus> {
    return {
      jobId,
      status: 'completed',
      imageUrl: this.mockLibrary.chicken,
      progress: 100,
    };
  }
}

export function getImageProvider(): ImageGenerationProvider {
  const fluxKey = getSecretKey('FLUX_API_KEY');
  if (fluxKey && fluxKey.trim() !== '') {
    return new FluxImageProvider(fluxKey);
  }
  return new MockImageProvider();
}
