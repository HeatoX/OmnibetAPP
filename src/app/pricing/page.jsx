'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Script from 'next/script';

const PRICING_TIERS = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        period: '7 días',
        description: 'Trial Gold Total',
        features: [
            'Acceso Gold por 7 días',
            'Sistemas IA activados',
            'Historial ilimitado (Trial)',
            'Temporizador de urgencia',
        ],
        notIncluded: [
            'Acceso vitalicio',
            'Soporte prioritario',
            'Renovación automática',
        ],
        cta: 'Plan Actual',
        disabled: true,
        color: 'gray',
    },
    {
        id: 'gold',
        name: 'Gold',
        price: 9.99,
        period: 'mes',
        description: 'Para apostadores serios',
        popular: true,
        features: [
            'Predicciones ilimitadas 70%+',
            'Análisis Head-to-Head',
            'Estadísticas detalladas',
            'Historial completo',
            'Soporte por email',
        ],
        notIncluded: [
            'Predicciones ML avanzadas',
            'Alertas value bet',
            'API access',
        ],
        cta: 'Obtener Gold',
        priceId: 'price_gold_monthly', // Stripe price ID
        color: 'yellow',
    },
    {
        id: 'diamond',
        name: 'Diamond',
        price: 29.99,
        period: 'mes',
        description: 'Máximo rendimiento',
        features: [
            'Todo lo de Gold +',
            'Predicciones ML avanzadas',
            'Alertas value bet en tiempo real',
            'Análisis de lesiones y clima',
            'Predicciones en vivo',
            'API access',
            'Soporte prioritario 24/7',
        ],
        notIncluded: [],
        cta: 'Obtener Diamond',
        priceId: 'price_diamond_monthly', // Stripe price ID
        color: 'cyan',
    },
];

export default function PricingPage() {
    const { user, profile, setShowLoginModal } = useAuth();
    const [loading, setLoading] = useState(null);
    const [sdkReady, setSdkReady] = useState(false);
    const [error, setError] = useState('');

    // V30.36 - Fix ReferenceError: currentTier is not defined
    const currentTier = profile?.subscription_tier || 'free';

    const handlePaymentSuccess = (details, tier) => {
        console.log('Payment Successful', details);
        // Refresh profile or redirect
        window.location.reload();
    };

    // V42.4: Proactive SDK monitoring (Polling fallback)
    useEffect(() => {
        const checkSDK = () => {
            if (typeof window !== 'undefined' && window.paypal) {
                setSdkReady(true);
                return true;
            }
            return false;
        };

        if (checkSDK()) return;

        const interval = setInterval(() => {
            if (checkSDK()) clearInterval(interval);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-grid py-20">
            <Script
                src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'}&currency=USD&intent=capture`}
                strategy="afterInteractive"
                onReady={() => setSdkReady(true)}
                onError={() => setError('Error al cargar el SDK de PayPal. Revisa tu conexión o bloqueadores de anuncios.')}
            />
            <div className="bg-glow"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        <span className="text-gradient">Elige tu Plan</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Desbloquea predicciones de alta precisión y lleva tu rentabilidad al siguiente nivel
                    </p>
                </div>

                {/* Stats bar */}
                <div className="glass-card max-w-4xl mx-auto p-6 mb-16 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-3xl font-bold text-gradient">82%</div>
                        <div className="text-sm text-gray-400">Precisión promedio</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-green-400">+18.5%</div>
                        <div className="text-sm text-gray-400">ROI mensual</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-cyan-400">2,847</div>
                        <div className="text-sm text-gray-400">Usuarios activos</div>
                    </div>
                </div>

                {/* Pricing cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {PRICING_TIERS.map((tier) => (
                        <div
                            key={tier.id}
                            className={`glass-card p-8 relative flex flex-col ${tier.popular ? 'border-2 border-yellow-500/50 scale-105' : ''
                                } ${currentTier === tier.id ? 'ring-2 ring-cyan-500' : ''}`}
                        >
                            {/* Popular badge */}
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 
                                                   text-black font-bold text-sm px-4 py-1 rounded-full">
                                        ⭐ MÁS POPULAR
                                    </span>
                                </div>
                            )}

                            {/* Current plan badge */}
                            {currentTier === tier.id && (
                                <div className="absolute -top-4 right-4">
                                    <span className="bg-cyan-500 text-black font-bold text-xs px-3 py-1 rounded-full">
                                        TU PLAN
                                    </span>
                                </div>
                            )}

                            {/* Header */}
                            <div className="text-center mb-8">
                                <h3 className={`text-2xl font-bold mb-2 ${tier.color === 'yellow' ? 'text-yellow-400' :
                                    tier.color === 'cyan' ? 'text-cyan-400' : 'text-gray-400'
                                    }`}>
                                    {tier.name}
                                </h3>
                                <p className="text-gray-400 text-sm">{tier.description}</p>
                            </div>

                            {/* Price */}
                            <div className="text-center mb-8">
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-5xl font-bold text-white">
                                        ${tier.price}
                                    </span>
                                    <span className="text-gray-400">/{tier.period}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-8 flex-grow">
                                {tier.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <span className="text-green-400 mt-0.5">✓</span>
                                        <span className="text-gray-300 text-sm">{feature}</span>
                                    </li>
                                ))}
                                {tier.notIncluded.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3 opacity-50">
                                        <span className="text-gray-500 mt-0.5">✗</span>
                                        <span className="text-gray-500 text-sm line-through">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA / PayPal Buttons */}
                            <div className="mt-auto min-h-[60px]">
                                {tier.id === 'free' ? (
                                    <button
                                        disabled
                                        className="w-full py-4 rounded-xl font-bold text-lg bg-gray-700 text-gray-400 cursor-not-allowed"
                                    >
                                        Plan Actual
                                    </button>
                                ) : currentTier === tier.id ? (
                                    <button
                                        disabled
                                        className="w-full py-4 rounded-xl font-bold text-lg bg-cyan-700 text-white opacity-50 cursor-not-allowed"
                                    >
                                        Plan Activo
                                    </button>
                                ) : (
                                    <div className="relative z-0">
                                        {sdkReady ? (
                                            <PayPalButtonWrapper
                                                tier={tier}
                                                userId={user?.id}
                                                onSuccess={(details) => handlePaymentSuccess(details, tier)}
                                                onError={(err) => setError(err)}
                                            />
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    if (!user) setShowLoginModal(true);
                                                }}
                                                className={`w-full py-4 rounded-xl font-bold text-lg animate-pulse transition-all
                                                    ${tier.color === 'yellow'
                                                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                                                        : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black'
                                                    }`}
                                            >
                                                {user ? 'Cargando PayPal...' : 'Inicia Sesión para Comprar'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="max-w-md mx-auto mt-8 bg-red-500/10 border border-red-500/50 
                                   text-red-400 px-4 py-3 rounded-xl text-center">
                        {error}
                    </div>
                )}

                {/* FAQ or guarantees */}
                <div className="max-w-4xl mx-auto mt-20 text-center">
                    <h2 className="text-2xl font-bold text-white mb-8">Garantías</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="glass-card p-6">
                            <div className="text-4xl mb-4">🔒</div>
                            <h3 className="font-bold text-white mb-2">Pago Seguro</h3>
                            <p className="text-gray-400 text-sm">Procesado por PayPal con encriptación de grado militar</p>
                        </div>
                        <div className="glass-card p-6">
                            <div className="text-4xl mb-4">💰</div>
                            <h3 className="font-bold text-white mb-2">Garantía 30 días</h3>
                            <p className="text-gray-400 text-sm">Respaldo total del oráculo inteligente</p>
                        </div>
                        <div className="glass-card p-6">
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="font-bold text-white mb-2">Resultados Verificables</h3>
                            <p className="text-gray-400 text-sm">Historial público de todas las predicciones</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * PayPal Button Component Wrapper
 */
function PayPalButtonWrapper({ tier, userId, onSuccess, onError }) {
    const [isRendered, setIsRendered] = useState(false);
    const containerId = `paypal-button-container-${tier.id}`;

    useEffect(() => {
        let timer;
        let retries = 0;
        const maxRetries = 10;

        const renderButton = () => {
            if (window.paypal) {
                const container = document.getElementById(containerId);
                if (container && container.innerHTML === '') {
                    window.paypal.Buttons({
                        createOrder: async () => {
                            const res = await fetch('/api/paypal/create-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    tierId: tier.id,
                                    amount: tier.price
                                })
                            });
                            const order = await res.json();
                            return order.id;
                        },
                        onApprove: async (data) => {
                            const res = await fetch('/api/paypal/capture-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    orderID: data.orderID,
                                    userId: userId,
                                    tierId: tier.id
                                })
                            });
                            const result = await res.json();
                            if (result.success) onSuccess(result);
                            else onError(result.error || 'Error capturando el pago');
                        },
                        onError: (err) => {
                            console.error('PayPal Button Error', err);
                            onError('Hubo un error con el botón de PayPal');
                        },
                        style: {
                            color: tier.color === 'yellow' ? 'gold' : 'blue',
                            shape: 'rect',
                            label: 'pay',
                            height: 50
                        }
                    }).render(`#${containerId}`);
                    setIsRendered(true);
                }
            } else if (retries < maxRetries) {
                retries++;
                timer = setTimeout(renderButton, 1000);
            }
        };

        timer = setTimeout(renderButton, 500);
        return () => clearTimeout(timer);
    }, [isRendered, containerId, tier, userId, onSuccess, onError]);

    return <div id={containerId} className="w-full"></div>;
}
