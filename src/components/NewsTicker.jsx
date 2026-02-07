'use client';
import { useState, useEffect } from 'react';

export default function NewsTicker() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    const updateNews = async () => {
        try {
            const res = await fetch('/api/news');
            const data = await res.json();
            if (data && data.news && data.news.length > 0) {
                // Formatting headlines with icons
                const footballIcons = ['⚽', '🏆', '🔥', '📈', '🚨', '🚑'];
                const formatted = data.news.map((item, idx) => {
                    const icon = footballIcons[idx % footballIcons.length];
                    return `${icon} ${item.source}: ${item.title}`;
                });
                setNews(formatted);
            }
        } catch (e) {
            console.error("News Update Error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        updateNews();
        // Refresh news every 10 minutes
        const interval = setInterval(updateNews, 600000);
        return () => clearInterval(interval);
    }, []);

    // Fallback if loading or empty
    const displayNews = (news && news.length > 0) ? news : [
        "⚽ Cargando últimas noticias deportivas...",
        "📈 Analizando mercados en tiempo real...",
        "💎 Escaneando señales de alta convicción..."
    ];

    return (
        <div className="fixed top-0 left-0 w-full z-[60] bg-[#050505] border-b border-white/5 overflow-hidden h-10 flex items-center">
            <div className="bg-cyan-500/10 h-full px-4 flex items-center border-r border-cyan-500/20 z-10 relative">
                <span className="text-cyan-400 text-xs font-black tracking-widest uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    Live News
                </span>
            </div>

            <div className="flex-1 overflow-hidden relative h-full flex items-center">
                <div className="whitespace-nowrap animate-ticker flex gap-12 pl-4">
                    {[...displayNews, ...displayNews].map((newsItem, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                            <span className="text-white/20">•</span>
                            <span>{newsItem}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-ticker {
                    animation: ticker 90s linear infinite;
                }
                .animate-ticker:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
