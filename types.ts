export interface VideoFormat {
  quality: string;
  resolution: string;
  size: string;
  ext: string;
  url: string;
}

export interface VideoMetadata {
  title: string;
  platform: string;
  thumbnail: string;
  duration: string;
  author: string;
  formats: VideoFormat[];
}

export interface DownloadHistoryItem {
  id: string;
  url: string;
  metadata: VideoMetadata;
  timestamp: number;
  status: 'completed' | 'failed' | 'processing';
}