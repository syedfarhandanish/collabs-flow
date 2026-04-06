"use client";

import { useState } from "react";
import { SkipForward, Radio, Link as LinkIcon, PlayCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// A curated list of the best ad-free, infinite study streams on YouTube
const CURATED_STREAMS = [
  { id: "jfKfPfyJRdk", name: "Lofi Girl Beats" },
  { id: "4xDzrJKXOOY", name: "Synthwave Radio" },
  { id: "lTRiuFIWV54", name: "Midnight Piano" },
  { id: "7NOSDKb0HlU", name: "Ambient Study" },
  { id: "5yx6BWlEVcU", name: "Jazz Hop Café" }
];

export function YouTubeWidget() {
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [videoId, setVideoId] = useState(CURATED_STREAMS[0].id);
  const [inputUrl, setInputUrl] = useState("");
  const [autoPlay, setAutoPlay] = useState(0); 

  const handleUpdateVideo = () => {
    if (!inputUrl.trim()) return;
    try {
      let id = inputUrl;
      if (inputUrl.includes("v=")) {
        id = inputUrl.split("v=")[1].split("&")[0];
      } else if (inputUrl.includes("youtu.be/")) {
        id = inputUrl.split("youtu.be/")[1].split("?")[0];
      }
      
      if (id) {
        setVideoId(id);
        setInputUrl("");
        setAutoPlay(1); 
      }
    } catch (error) {
      console.error("Invalid YouTube URL");
    }
  };

  const handleNextStream = () => {
    const nextIndex = (currentStreamIndex + 1) % CURATED_STREAMS.length;
    setCurrentStreamIndex(nextIndex);
    setVideoId(CURATED_STREAMS[nextIndex].id);
    setAutoPlay(1); 
  };

  return (
    <div className="relative group bg-gradient-to-br from-gray-800/80 to-gray-900/90 backdrop-filter backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-gray-700/50 flex flex-col h-full min-h-[350px] overflow-hidden transition-all duration-500 hover:border-gray-600/50">
      
      {/* Decorative background ambient glow */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000" />
      
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <Radio className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100 tracking-tight">Focus Stream</h2>
            <p className="text-xs font-medium text-gray-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" /> 
              Live Radio
            </p>
          </div>
        </div>
        
        {/* Next Station Button */}
        <Button 
          onClick={handleNextStream}
          variant="ghost" 
          className="bg-gray-800/50 hover:bg-gray-700 text-gray-300 rounded-full h-10 px-4 transition-all duration-300 hover:text-white border border-gray-700/50"
        >
          <SkipForward className="w-4 h-4 mr-2 text-red-400" />
          Next Station
        </Button>
      </div>
      
      {/* Video Embed Player */}
      <div className="flex-1 w-full rounded-2xl overflow-hidden bg-black/80 border border-gray-700/50 relative aspect-video shadow-[0_8px_30px_rgba(0,0,0,0.3)] z-10 group-hover:shadow-[0_8px_40px_rgba(239,68,68,0.1)] transition-shadow duration-500">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay}&rel=0&modestbranding=1`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        ></iframe>
      </div>

      {/* Smart Input Bar with Smooth Animated Button */}
      <div className="mt-5 relative z-10 group/input flex items-center">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <LinkIcon className="w-4 h-4 text-gray-500 group-focus-within/input:text-red-400 transition-colors duration-300" />
        </div>
        
        <Input
          type="text"
          placeholder="Paste a YouTube link..."
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleUpdateVideo();
            }
          }}
          className="bg-gray-900/60 border-gray-700/50 text-gray-200 placeholder:text-gray-500 rounded-full h-12 pl-11 pr-24 w-full focus-visible:ring-1 focus-visible:ring-red-500/50 transition-all shadow-inner"
        />

        {/* Animated Inner Button */}
        <div 
          className={`absolute right-1.5 transition-all duration-300 ease-out flex items-center ${
            inputUrl.trim() 
              ? "opacity-100 translate-x-0 pointer-events-auto scale-100" 
              : "opacity-0 translate-x-4 pointer-events-none scale-90"
          }`}
        >
          <Button 
            onClick={handleUpdateVideo}
            size="sm"
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white rounded-full h-9 px-4 transition-all shadow-md border border-red-400/20"
          >
            <PlayCircle className="w-4 h-4 mr-1.5" />
            Play
          </Button>
        </div>
      </div>

    </div>
  );
}