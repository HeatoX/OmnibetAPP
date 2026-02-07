'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const SelectionContext = createContext();

export function SelectionProvider({ children }) {
    const [selections, setSelections] = useState([]);
    const [stats, setStats] = useState({ total: 0, won: 0, lost: 0, accuracy: 0 });

    // Load using Private Room logic (Daily Persistence)
    useEffect(() => {
        const stored = localStorage.getItem('private_room_picks');
        const lastDate = localStorage.getItem('private_room_date');
        const today = new Date().toDateString();

        if (lastDate !== today) {
            // New day, auto-clear
            setSelections([]);
            localStorage.setItem('private_room_date', today);
            localStorage.removeItem('private_room_picks');
        } else if (stored) {
            try {
                setSelections(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse selections", e);
            }
        } else {
            // Initialize date if new
            localStorage.setItem('private_room_date', today);
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('private_room_picks', JSON.stringify(selections));
        calculateStats(selections);
    }, [selections]);

    const calculateStats = (list) => {
        const total = list.length;
        if (total === 0) {
            setStats({ total: 0, won: 0, lost: 0, accuracy: 0 });
            return;
        }

        // Determine winners based on stored "prediction" and "real score" if available
        // Note: Real score updating requires re-fetching data, which we might do in the Modal.
        // For now, we calculate based on what's in the object.
        let won = 0;
        let lost = 0;

        list.forEach(item => {
            // Logic to determine if "won"
            // We need to check if match is finished first
            // This logic is tricky without live updates. 
            // We'll rely on the user or a refresh to update the match object status.
            if (item.status === 'finished' || item.status === 'FT') {
                if (item.prediction?.winner === 'home' && item.home.score > item.away.score) won++;
                else if (item.prediction?.winner === 'away' && item.away.score > item.home.score) won++;
                else if (item.prediction?.winner === 'draw' && item.home.score === item.away.score) won++;
                else lost++;
            }
        });

        const accuracy = (won + lost) > 0 ? Math.round((won / (won + lost)) * 100) : 0;
        setStats({ total, won, lost, accuracy });
    };

    const addMatch = (match) => {
        if (selections.find(m => m.id === match.id)) return; // No duplicates
        setSelections(prev => [...prev, match]);
    };

    const removeMatch = (matchId) => {
        setSelections(prev => prev.filter(m => m.id !== matchId));
    };

    const clearSelection = () => {
        setSelections([]);
    };

    const isSelected = (matchId) => {
        return selections.some(m => m.id === matchId);
    };

    return (
        <SelectionContext.Provider value={{
            selections,
            addMatch,
            removeMatch,
            clearSelection,
            isSelected,
            stats
        }}>
            {children}
        </SelectionContext.Provider>
    );
}

export function useSelection() {
    return useContext(SelectionContext);
}
