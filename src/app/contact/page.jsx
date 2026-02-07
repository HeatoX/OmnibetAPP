'use client';

import Link from 'next/link';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="py-6 px-4 border-b border-slate-800">
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <Link href="/" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver al inicio
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 20px' }}>
                <div className="text-center mb-16">
                    <h1
                        className="text-4xl md:text-5xl font-bold mb-6"
                        style={{
                            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Contáctanos
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.25rem' }}>
                        Estamos aquí para ayudarte. Elige el canal que prefieras.
                    </p>
                </div>

                {/* Contact Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">

                    {/* Instagram */}
                    <a
                        href="https://instagram.com/OmniBet"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-8 rounded-2xl transition-all hover:scale-105"
                        style={{
                            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1))',
                            border: '2px solid rgba(236, 72, 153, 0.3)'
                        }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(135deg, #ec4899, #a855f7)'
                                }}
                            >
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Instagram</h3>
                                <p style={{ color: '#ec4899', fontSize: '1.1rem' }}>@OmniBet</p>
                            </div>
                        </div>
                        <p style={{ color: '#94a3b8' }}>
                            Síguenos para las últimas predicciones, tips y contenido exclusivo.
                        </p>
                    </a>

                    {/* Email */}
                    <a
                        href="mailto:contacto@omnibet.ai"
                        className="block p-8 rounded-2xl transition-all hover:scale-105"
                        style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
                            border: '2px solid rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(135deg, #10b981, #06b6d4)'
                                }}
                            >
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Email</h3>
                                <p style={{ color: '#10b981', fontSize: '1.1rem' }}>contacto@omnibet.ai</p>
                            </div>
                        </div>
                        <p style={{ color: '#94a3b8' }}>
                            Escríbenos para consultas generales, soporte técnico o colaboraciones.
                        </p>
                    </a>

                </div>

                {/* Additional Contact Options */}
                <div
                    className="p-8 rounded-2xl text-center"
                    style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(100, 116, 139, 0.3)'
                    }}
                >
                    <h2 className="text-2xl font-bold text-white mb-4">Horario de Atención</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                        Nuestro equipo de soporte está disponible para ayudarte:
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-emerald-400 font-semibold mb-2">Lunes a Viernes</p>
                            <p style={{ color: '#cbd5e1' }}>9:00 AM - 6:00 PM (EST)</p>
                        </div>
                        <div>
                            <p className="text-emerald-400 font-semibold mb-2">Fines de Semana</p>
                            <p style={{ color: '#cbd5e1' }}>10:00 AM - 2:00 PM (EST)</p>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">Preguntas Frecuentes</h2>

                    <div className="space-y-4">
                        {[
                            {
                                question: '¿Cómo puedo cancelar mi suscripción?',
                                answer: 'Puedes cancelar tu suscripción en cualquier momento desde la sección "Mi Cuenta". La cancelación será efectiva al final del período de facturación actual.'
                            },
                            {
                                question: '¿Las predicciones están garantizadas?',
                                answer: 'No. Las predicciones son orientativas basadas en análisis de IA. Las apuestas deportivas conllevan riesgo y no garantizamos resultados.'
                            },
                            {
                                question: '¿Cómo funciona la prueba gratuita del plan Pro?',
                                answer: 'Tienes 7 días gratis para probar todas las funcionalidades Pro. Si no cancelas antes de que termine, se cobrará automáticamente.'
                            },
                            {
                                question: '¿En qué deportes ofrecen predicciones?',
                                answer: 'Cubrimos fútbol, baloncesto, tenis, béisbol, hockey y más de 15 deportes adicionales según tu plan.'
                            }
                        ].map((faq, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-xl"
                                style={{
                                    background: 'rgba(30, 41, 59, 0.5)',
                                    border: '1px solid rgba(100, 116, 139, 0.2)'
                                }}
                            >
                                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                                <p style={{ color: '#94a3b8' }}>{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-16 pt-8 border-t border-slate-700 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
                        style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#ffffff'
                        }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver al Inicio
                    </Link>
                </div>
            </main>
        </div>
    );
}
