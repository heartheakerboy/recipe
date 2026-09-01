import { GenerateImageRequest, GenerateImageResponse } from '../types/image';

export interface ImageGenerationProvider {
  readonly providerName: string;
  generateRecipeHero(request: GenerateImageRequest): Promise<GenerateImageResponse>;
  generatePinterestImage(request: GenerateImageRequest): Promise<GenerateImageResponse>;
  generateStepImage(request: GenerateImageRequest): Promise<GenerateImageResponse>;
}
