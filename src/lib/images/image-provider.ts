/**
 * Image Generation Provider Abstraction for FlavorNest.xyz
 */

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
 * Real FLUX.1 API Provider (BFL / Replicate / Fal / OpenAI-compatible endpoint)
 */
export class FluxImageProvider implements ImageGenerationProvider {
  name = 'flux-api';
  private apiKey?: string;
  private baseUrl: string;
  private model: string;
  private timeoutMs: number;

  constructor(
    apiKey?: string,
    baseUrl = process.env.FLUX_API_BASE_URL || 'https://api.bfl.ml/v1',
    model = process.env.FLUX_MODEL || 'flux-pro-1.1',
    timeoutMs = 45000
  ) {
    this.apiKey = apiKey || process.env.FLUX_API_KEY;
    this.baseUrl = baseUrl;
    this.model = model;
    this.timeoutMs = timeoutMs;
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now();
    if (!this.apiKey) {
      throw new Error('FLUX API Key is not configured in environment variables.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/flux-pro-1.1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Key': this.apiKey,
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt: request.prompt,
          width: request.width,
          height: request.height,
          prompt_upsampling: true,
          seed: request.seed,
          safety_tolerance: 2,
          output_format: 'jpeg',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
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
          error: `FLUX API Error (${response.status}): ${errorText}`,
        };
      }

      const data = await response.json();
      const jobId = data.id || `flux_${Date.now()}`;

      // If immediate result returned
      if (data.result?.sample || data.image_url) {
        return {
          success: true,
          jobId,
          status: 'completed',
          imageUrl: data.result?.sample || data.image_url,
          width: request.width,
          height: request.height,
          format: 'jpeg',
          provider: this.name,
          model: this.model,
          durationMs: Date.now() - startTime,
        };
      }

      // Asynchronous generation queued
      return {
        success: true,
        jobId,
        status: 'generating',
        width: request.width,
        height: request.height,
        format: 'jpeg',
        provider: this.name,
        model: this.model,
        durationMs: Date.now() - startTime,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
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
  if (process.env.FLUX_API_KEY) {
    return new FluxImageProvider();
  }
  return new MockImageProvider();
}
