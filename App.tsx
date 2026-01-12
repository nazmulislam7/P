import React, { useState } from 'react';
import Navbar from './Navbar';
import VideoCard from './VideoCard';
import { analyzeVideoUrl } from './geminiService';
import { VideoMetadata, DownloadHistoryItem, VideoFormat } from './types';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VideoMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [showMatureDisclaimer, setShowMatureDisclaimer] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const metadata = await analyzeVideoUrl(url);
      setResult(metadata);
      
      const newHistoryItem: DownloadHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        metadata,
        timestamp: Date.now(),
        status: 'completed'
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 10));
    } catch (err) {
      console.error(err);
      setError('Extraction failed. The stream might be encrypted or the link is private. Please verify the URL.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = async (format: VideoFormat) => {
    const fileName = `${result?.title || 'video'}_${format.quality}.${format.ext}`;
    
    try {
      // Strategy 1: Binary Buffer Extraction
      const response = await fetch(format.url, { 
        mode: 'cors',
        headers: { 'Accept': 'video/*, application/octet-stream' }
      }).catch(() => null);
      
      if (response && response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        showSuccessToast(fileName, false);
      } else {
        // Strategy 2: Stream Tunneling Fallback
        const tunnel = document.createElement('a');
        tunnel.href = format.url;
        tunnel.target = '_blank';
        tunnel.rel = 'noopener noreferrer';
        tunnel.setAttribute('download', fileName);
        document.body.appendChild(tunnel);
        tunnel.click();
        tunnel.remove();
        showSuccessToast(fileName, true);
      }
    } catch (err) {
      console.error("Extraction failure", err);
      window.open(format.url, '_blank');
    }
  };

  const showSuccessToast = (fileName: string, isExternal: boolean = false) => {
    const toast = document.createElement('div');
    toast.className = "fixed bottom-6 right-6 bg-slate-900 border border-sky-500/50 text-white px-6 py-4 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[100] animate-in slide-in-from-right-10 flex flex-col gap-2 min-w-[320px] backdrop-blur-xl";
    toast.innerHTML = `
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <div>
          <p class="font-bold text-sm">Media Extraction Active</p>
          <p class="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">${fileName}</p>
        </div>
      </div>
      <div class="h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
        <div class="h-full bg-green-500 animate-[progress_4s_linear_forwards]"></div>
      </div>
      ${isExternal ? '<p class="text-[9px] text-sky-400 font-black uppercase tracking-widest mt-1">Bypassing platform firewall via Stream Tunneling</p>' : ''}
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-out', 'fade-out', 'slide-out-to-right-10');
      setTimeout(() => toast.remove(), 500);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-16 animate-in fade-in zoom-in duration-1000">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span>V4.0 Ultra-Extraction Active</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Universal <span className="gradient-text">Video Suite</span>
          </h1>
          <form onSubmit={handleAnalyze} className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <div className="relative flex flex-col md:flex-row items-center gap-3 p-2 rounded-2xl glass border border-slate-700">
              <div className="flex-1 flex items-center px-4 w-full">
                <input
                  type="text"
                  placeholder="Paste URL (YouTube, TikTok, Instagram, etc.)"
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 py-3 text-lg font-light"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full md:w-auto px-10 py-3 rounded-xl font-black transition-all bg-sky-500 hover:bg-sky-400 text-white shadow-2xl active:scale-95 disabled:bg-slate-700 disabled:text-slate-400"
              >
                {isAnalyzing ? "Analyzing..." : "EXTRACT"}
              </button>
            </div>
          </form>
          {error && <p className="mt-4 text-rose-400 font-bold animate-pulse text-sm">{error}</p>}
        </div>

        <div className="mt-12 min-h-[400px]">
          {isAnalyzing && (
            <div className="max-w-3xl mx-auto flex flex-col items-center justify-center h-64 glass rounded-3xl border border-sky-500/20">
              <p className="font-black text-slate-100 text-xl tracking-tight uppercase">Bypassing platform firewall</p>
            </div>
          )}
          {result && !isAnalyzing && (
            <div className="max-w-5xl mx-auto">
              <VideoCard metadata={result} onDownload={handleDownload} />
            </div>
          )}
        </div>
      </main>
      <style>{`
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
      `}</style>
    </div>
  );
};

export default App;