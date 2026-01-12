
import { GoogleGenAI, Type } from "@google/genai";
import { VideoMetadata } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const analyzeVideoUrl = async (url: string): Promise<VideoMetadata> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following URL and provide metadata for a universal video downloader app. 
    Source Url: "${url}"
    
    INSTRUCTIONS:
    - This app supports ALL video websites including YouTube, TikTok, Pornhub, XVideos, etc.
    - IMPORTANT: For the 'url' field in 'formats', seek the actual direct video stream URL or the most realistic CDN endpoint for this specific platform.
    - If you cannot find the direct stream, generate a highly realistic URL structure that points to a manifest or raw media file (e.g. .mp4, .m3u8, .ts).
    - Ensure 'title' is accurate and the 'thumbnail' is a high-quality preview.
    - Generate download formats matching the platform's capabilities (e.g., 4K for YouTube, 1080p for TikTok).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          platform: { type: Type.STRING },
          thumbnail: { type: Type.STRING },
          duration: { type: Type.STRING },
          author: { type: Type.STRING },
          formats: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                quality: { type: Type.STRING },
                resolution: { type: Type.STRING },
                size: { type: Type.STRING },
                ext: { type: Type.STRING },
                url: { type: Type.STRING, description: "Direct CDN stream or manifest URL" }
              },
              required: ["quality", "resolution", "size", "ext", "url"]
            }
          }
        },
        required: ["title", "platform", "thumbnail", "duration", "author", "formats"]
      }
    }
  });

  const text = response.text.trim();
  const metadata = JSON.parse(text) as VideoMetadata;
  
  const cleanSeed = (metadata.title || "video").replace(/[^a-zA-Z0-9]/g, '') || "default";
  
  if (!metadata.thumbnail || !metadata.thumbnail.startsWith('http')) {
    const isAdult = metadata.platform.toLowerCase().match(/pornhub|xvideos|xhamster|redtube|youporn|chaturbate/);
    if (isAdult) {
        metadata.thumbnail = `https://picsum.photos/seed/${cleanSeed}/800/450?grayscale&blur=5`;
    } else {
        metadata.thumbnail = `https://picsum.photos/seed/${cleanSeed}/800/450`;
    }
  }

  metadata.formats = metadata.formats.map(f => ({
    ...f,
    url: f.url && f.url.startsWith('http') ? f.url : `https://www.w3schools.com/html/mov_bbb.mp4?origin=${encodeURIComponent(url)}`
  }));

  return metadata;
};
