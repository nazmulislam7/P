
import React, { useState } from 'react';
import { VideoMetadata, VideoFormat } from './types';

interface VideoCardProps {
  metadata: VideoMetadata;
  onDownload: (format: VideoFormat) => Promise<void>;
}

const VideoCard: React.FC<VideoCardProps> = ({ metadata, onDownload }) => {
  const [imgError, setImgError] = useState(false);
  const [downloadStates, setDownloadStates] = useState<Record<string, { progress: number, status: string }>>({});

  const startDownload = async (format: VideoFormat) => {
    const formatKey = `${format.quality}-${format.resolution}`;
    if (downloadStates[formatKey]?.progress > 0 && downloadStates[formatKey]?.progress < 100) return;

    setDownloadStates(prev => ({ ...prev, [formatKey]: { progress: 0, status: 'Initializing...' } }));

    const stages = [
      { p: 15, s: 'Bypassing CDN restrictions...' },
      { p: 40, s: 'Fetching stream segments...' },
      { p: 65, s: 'Merging video & audio buffers...' },
      { p: 90, s: 'Finalizing container...' },
      { p: 100, s: 'Ready' }
    ];

    for (const stage of stages) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
      setDownloadStates(prev => ({ ...prev, [formatKey]: { progress: stage.p, status: stage.s } }));
    }

    await onDownload(format);
    
    setTimeout(() => {
      setDownloadStates(prev => {
        const next = { ...prev };
        delete next[formatKey];
        return next;
      });
    }, 3000);
  };

  const handleDownloadAll = () => {
    metadata.formats.slice(0, 3).forEach(f => startDownload(f));
  };

  return (
    <div className="glass rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative aspect-video lg:aspect-auto bg-slate-800 flex items-center justify-center min-h-[300px]">
          {imgError ? (
            <div className="flex flex-col items-center justify-center text-slate-600">
              <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-widest">Preview Unavailable</span>
            </div>
          ) : (
            <img 
              src={metadata.thumbnail} 
              alt={metadata.title} 
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
            <div className="max-w-[70%]">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-500 rounded text-white uppercase tracking-wider mb-2 inline-block">
                {metadata.platform}
              </span>
              <p className="text-sm font-medium text-white line-clamp-1">{metadata.author}</p>
            </div>
            <span className="px-2 py-1 text-xs font-mono bg-black/60 rounded text-white backdrop-blur-sm">
              {metadata.duration}
            </span>
          </div>
        </div>

        <div className="p-6 lg:p-8 flex flex-col">
          <div className="flex justify-between items-start mb-4 gap-4">
            <h2 className="text-xl md:text-2xl font-bold leading-tight">{metadata.title}</h2>
            <button 
              onClick={handleDownloadAll}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/20 transition-all flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Batch All
            </button>
          </div>
          
          <div className="flex-1 space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">High Definition Formats</h3>
            <div className="space-y-2">
              {metadata.formats.map((format, idx) => {
                const state = downloadStates[`${format.quality}-${format.resolution}`];
                return (
                  <div key={idx} className="relative group overflow-hidden">
                    <div className={`flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border transition-all ${state ? 'border-sky-500/50 bg-sky-500/5' : 'border-slate-700/50 hover:border-slate-600'}`}>
                      <div className="flex items-center space-x-3 z-10">
                        <div className={`p-2 rounded-lg ${state ? 'bg-sky-500 text-white' : 'bg-slate-700/50 text-sky-400'}`}>
                          <svg className={`w-4 h-4 ${state?.progress < 100 ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-100 text-sm">{format.quality}</p>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">{format.resolution}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{format.ext} • {format.size}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 z-10">
                        {state ? (
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-sky-400 mb-1">{state.status}</p>
                            <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-sky-500 transition-all duration-500" 
                                style={{ width: `${state.progress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => startDownload(format)}
                            className="px-4 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white text-xs font-bold transition-all border border-sky-500/20 active:scale-95 shadow-lg shadow-sky-500/5"
                          >
                            Extract
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global CDN Status: Online</span>
             </div>
             <p className="text-[10px] text-slate-600 font-medium italic">Secure SSL Tunnel Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
