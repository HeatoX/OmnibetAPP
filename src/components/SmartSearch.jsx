'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Smart Search Component
 * Command+K style universal search for teams, leagues, and sports
 */
export default function SmartSearch({ isOpen, onClose, matches = [] }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const router = useRouter();

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Search logic
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const q = query.toLowerCase();
        const searchResults = [];

        // 1. Search in current matches
        if (matches && matches.length > 0) {
            matches.forEach(match => {
                const home = match.home?.name?.toLowerCase() || '';
                const away = match.away?.name?.toLowerCase() || '';
                const league = match.league?.toLowerCase() || '';

                if (home.includes(q) || away.includes(q)) {
                    searchResults.push({
                        type: 'match',
                        icon: match.sportIcon,
                        title: `${match.home?.name} vs ${match.away?.name}`,
                        subtitle: match.league,
                        id: match.id,
                        data: match
                    });
                }
            });
        }

        // 2. Search Static Sports/Leagues (Navigation)
        const staticNav = [
            { title: 'Fútbol', type: 'nav', path: '/app?sport=soccer', icon: '⚽' },
            { title: 'Basketball', type: 'nav', path: '/app?sport=basketball', icon: '🏀' },
            { title: 'Tennis', type: 'nav', path: '/app?sport=tennis', icon: '🎾' },
            { title: 'Baseball', type: 'nav', path: '/app?sport=baseball', icon: '⚾' },
            { title: 'NFL', type: 'nav', path: '/app?sport=football', icon: '🏈' },
            { title: 'Premier League', type: 'nav', path: '/app?sport=soccer', icon: '🏆' },
            { title: 'La Liga', type: 'nav', path: '/app?sport=soccer', icon: '🇪🇸' },
            { title: 'NBA', type: 'nav', path: '/app?sport=basketball', icon: '🇺🇸' },
        ];

        staticNav.forEach(item => {
            if (item.title.toLowerCase().includes(q)) {
                searchResults.push(item);
            }
        });

        setResults(searchResults.slice(0, 5)); // Limit to 5 results
        setSelectedIndex(0);

    }, [query, matches]);

    // Handle Keyboard Navigation
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results[selectedIndex]) {
                handleSelect(results[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleSelect = (item) => {
        if (item.type === 'nav') {
            router.push(item.path);
            onClose();
        } else if (item.type === 'match') {
            // Dispatch custom event to open match modal (since this might be in header)
            const event = new CustomEvent('open-match-details', { detail: item.data });
            window.dispatchEvent(event);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Search Container */}
            <div className="relative w-full max-w-2xl bg-[#0a0a12] border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Input Header */}
                <div className="flex items-center px-4 py-3 border-b border-gray-800">
                    <span className="text-gray-400 text-xl mr-3">🔍</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg h-12"
                        placeholder="Buscar equipos, ligas o deportes..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="hidden sm:flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs">ESC</kbd>
                    </div>
                </div>

                {/* Results List */}
                {results.length > 0 && (
                    <div className="py-2 max-h-[60vh] overflow-y-auto">
                        {results.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => handleSelect(item)}
                                className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${index === selectedIndex ? 'bg-cyan-500/10 border-l-4 border-cyan-500' : 'hover:bg-gray-900 border-l-4 border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{item.icon}</span>
                                    <div>
                                        <div className={`font-medium ${index === selectedIndex ? 'text-cyan-400' : 'text-white'}`}>
                                            {item.title}
                                        </div>
                                        {item.subtitle && (
                                            <div className="text-sm text-gray-500">{item.subtitle}</div>
                                        )}
                                    </div>
                                </div>
                                {item.type === 'match' && (
                                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Partido</span>
                                )}
                                {item.type === 'nav' && (
                                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Ir a</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {query && results.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                        <p>No se encontraron resultados para "{query}"</p>
                    </div>
                )}

                {/* Initial State / Help */}
                {!query && (
                    <div className="px-4 py-8 text-center">
                        <p className="text-gray-400 text-sm mb-4">Prueba buscando:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {['Real Madrid', 'Lakers', 'Premier League', 'NBA'].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setQuery(tag)}
                                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 transition-colors"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
