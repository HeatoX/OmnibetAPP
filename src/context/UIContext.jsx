'use client';

import { createContext, useContext, useState } from 'react';

const UIContext = createContext({});

export function UIProvider({ children }) {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showTrialModal, setShowTrialModal] = useState(false);

    const toggleLoginModal = (val) => setShowLoginModal(prev => val !== undefined ? val : !prev);
    const toggleUpgradeModal = (val) => setShowUpgradeModal(prev => val !== undefined ? val : !prev);
    const toggleTrialModal = (val) => setShowTrialModal(prev => val !== undefined ? val : !prev);

    const value = {
        showLoginModal,
        setShowLoginModal: toggleLoginModal,
        showUpgradeModal,
        setShowUpgradeModal: toggleUpgradeModal,
        showTrialModal,
        setShowTrialModal: toggleTrialModal
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
}

export default UIContext;
