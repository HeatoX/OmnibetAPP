"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AlertContext = createContext();

export function useAlerts() {
    return useContext(AlertContext);
}

export function AlertProvider({ children }) {
    const [alerts, setAlerts] = useState([]);

    // Function to add a new alert (can be called from anywhere)
    const addAlert = (alert) => {
        const id = Date.now();
        setAlerts(prev => [{ ...alert, id }, ...prev]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeAlert(id);
        }, 8000);
    };

    const removeAlert = (id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    return (
        <AlertContext.Provider value={{ addAlert }}>
            {children}
            <div className="fixed bottom-4 left-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
                <AnimatePresence>
                    {alerts.map(alert => (
                        <AlertToast key={alert.id} alert={alert} onClose={() => removeAlert(alert.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </AlertContext.Provider>
    );
}

function AlertToast({ alert, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.9 }}
            className="pointer-events-auto bg-[#1a1c29]/90 backdrop-blur-md border border-l-4 border-l-green-500 border-white/10 p-4 rounded-xl shadow-2xl flex items-start gap-3 relative overflow-hidden"
        >
            {/* Background Flash */}
            <div className={`absolute inset-0 animate-pulse ${alert.type === 'shark' ? 'bg-green-500/5' : alert.type === 'info' ? 'bg-blue-500/5' : 'bg-cyan-500/5'}`}></div>

            <div className="text-2xl mt-1">
                {alert.type === 'shark' ? '🦈' : alert.type === 'info' ? 'ℹ️' : '✅'}
            </div>
            <div className="flex-1">
                <h4 className={`font-bold text-sm uppercase tracking-wide flex items-center gap-2 ${alert.type === 'shark' ? 'text-green-400' : 'text-white'}`}>
                    {alert.title || 'Alerta'}
                    {alert.value && (
                        <span className="bg-green-500/20 text-green-400 text-[10px] px-1.5 py-0.5 rounded border border-green-500/30">
                            +{alert.value}%
                        </span>
                    )}
                </h4>
                <p className="text-white font-bold text-sm mt-1">{alert.match || alert.message}</p>
                {alert.reason && <p className="text-gray-400 text-xs mt-0.5">{alert.reason}</p>}
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                ✕
            </button>
        </motion.div>
    );
}
