'use client';
import { useState, useEffect } from 'react';
import { fetchLatestNews } from '@/lib/news-service';

export default function NewsFeed() {
    const [news, setNews] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const load = async () => {
            const data = await fetchLatestNews();
            setNews(data);
        };
        load();
        const interval = setInterval(load, 300000); // Update every 5m
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (news.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % news.length);
        }, 8000); // Cycle every 8s
        return () => clearInterval(interval);
    }, [news]);

    if (news.length === 0) return null;

    const current = news[currentIndex];

    return (
        <div className="w-full bg-black/40 backdrop-blur-md border-b border-white/5 py-2 overflow-hidden h-10 flex items-center">
            <div className="container mx-auto px-4 flex items-center gap-4">
                <div className="flex items-center gap-2 shrink-0">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">LIVE NEWS</span>
                </div>

                <div className="flex-1 overflow-hidden relative h-6">
                    <div
                        key={current.id}
                        className="animate-slideUp flex items-center gap-3"
                    >
                        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-black uppercase">
                            {current.category}
                        </span>
                        <span className="text-sm text-gray-200 font-medium truncate">
                            {current.title}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                            {current.source} • {current.time}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
