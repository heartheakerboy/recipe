export interface PinterestPinDraft {
  title: string;
  description: string;
  link: string;
  boardName: string;
  imageCdnUrl: string;
  keywords: string[];
}

export interface PinterestPublishResult {
  success: boolean;
  pinId?: string;
  pinUrl?: string;
  error?: string;
}
