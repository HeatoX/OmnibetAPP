'use client';

import { useState } from 'react';
import { useSelection } from '@/context/SelectionContext';
import PrivateRoomModal from './PrivateRoomModal';

export default function SelectionFloatingButton() {
    const { selections } = useSelection();
    const [isOpen, setIsOpen] = useState(false);

    if (selections.length === 0) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full p-4 shadow-lg z-40 transition-transform hover:scale-105 flex items-center justify-center gap-2 group"
            >
                <span className="text-xl">🕵️‍♂️</span>
                <span className="bg-black text-cyan-500 text-xs font-bold px-2 py-0.5 rounded-full absolute -top-2 -right-2 border border-cyan-500">
                    {selections.length}
                </span>
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm">
                    Sala Privada
                </span>
            </button>

            <PrivateRoomModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
