'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';

// Stripe will be initialized with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key');

const PRICING_TIERS = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        period: 'mes',
        description: 'Perfecto para probar',
        features: [
            '2 predicciones por mes',
            'Predicciones básicas',
            'Historial limitado',
            'Sin soporte',
        ],
        notIncluded: [
            'Predicciones ilimitadas',
            'Análisis H2H',
            'Alertas value bet',
            'API access',
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
    const [error, setError] = useState('');

    const handleSubscribe = async (tier) => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        if (!tier.priceId) return;

        setLoading(tier.id);
        setError('');

        try {
            // Create checkout session via API route
            const response = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId: tier.priceId,
                    userId: user.id,
                    email: user.email,
                }),
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Redirect to Stripe Checkout
            const stripe = await stripePromise;
            await stripe.redirectToCheckout({ sessionId: data.sessionId });
        } catch (err) {
            setError(err.message || 'Error al procesar el pago');
        }

        setLoading(null);
    };

    const currentTier = profile?.subscription_tier || 'free';

    return (
        <div className="min-h-screen bg-grid py-20">
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
                            className={`glass-card p-8 relative ${tier.popular ? 'border-2 border-yellow-500/50 scale-105' : ''
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
                            <ul className="space-y-3 mb-8">
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

                            {/* CTA */}
                            <button
                                onClick={() => handleSubscribe(tier)}
                                disabled={tier.disabled || loading === tier.id || currentTier === tier.id}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all
                                    ${tier.color === 'yellow'
                                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:shadow-lg hover:shadow-yellow-500/30'
                                        : tier.color === 'cyan'
                                            ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:shadow-lg hover:shadow-cyan-500/30'
                                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading === tier.id ? 'Procesando...' : tier.cta}
                            </button>
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
                            <p className="text-gray-400 text-sm">Procesado por Stripe con encriptación SSL</p>
                        </div>
                        <div className="glass-card p-6">
                            <div className="text-4xl mb-4">💰</div>
                            <h3 className="font-bold text-white mb-2">Garantía 30 días</h3>
                            <p className="text-gray-400 text-sm">Reembolso completo si no estás satisfecho</p>
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
