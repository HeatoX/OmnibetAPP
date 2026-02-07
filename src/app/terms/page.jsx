'use client';

import Link from 'next/link';

export default function TermsPage() {
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
                <h1
                    className="text-4xl md:text-5xl font-bold mb-8"
                    style={{
                        background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    Términos y Condiciones
                </h1>

                <p style={{ color: '#64748b', marginBottom: '40px' }}>
                    Última actualización: Febrero 2026
                </p>

                <div style={{ color: '#cbd5e1', lineHeight: '1.8' }} className="space-y-8">

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Aceptación de los Términos</h2>
                        <p>
                            Al acceder y utilizar OmniBet AI ("el Servicio"), usted acepta estar sujeto a estos Términos y Condiciones.
                            Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al Servicio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Descripción del Servicio</h2>
                        <p>
                            OmniBet AI es una plataforma de predicciones deportivas que utiliza inteligencia artificial para analizar
                            datos y proporcionar pronósticos. El Servicio tiene fines exclusivamente informativos y de entretenimiento.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Responsabilidad del Usuario</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>El usuario debe ser mayor de 18 años para utilizar el Servicio.</li>
                            <li>Las predicciones proporcionadas son orientativas y no garantizan resultados.</li>
                            <li>El usuario es responsable de verificar la legalidad de las apuestas en su jurisdicción.</li>
                            <li>OmniBet AI no fomenta ni promueve las apuestas ilegales.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Limitación de Responsabilidad</h2>
                        <p>
                            OmniBet AI no se hace responsable de pérdidas económicas derivadas del uso de las predicciones.
                            Las apuestas deportivas conllevan riesgo y el usuario debe apostar responsablemente y solo con
                            dinero que pueda permitirse perder.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Propiedad Intelectual</h2>
                        <p>
                            Todo el contenido del Servicio, incluyendo textos, gráficos, logos, iconos y software,
                            está protegido por derechos de autor y pertenece a OmniBet AI.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Cuentas de Usuario</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>El usuario es responsable de mantener la confidencialidad de su cuenta.</li>
                            <li>Está prohibido compartir credenciales de acceso.</li>
                            <li>OmniBet AI se reserva el derecho de suspender cuentas que violen estos términos.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Pagos y Suscripciones</h2>
                        <p>
                            Los planes de pago se renovarán automáticamente a menos que se cancelen. Las cancelaciones
                            deben realizarse antes del próximo ciclo de facturación. No se realizan reembolsos por
                            períodos parciales.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Modificaciones</h2>
                        <p>
                            OmniBet AI se reserva el derecho de modificar estos términos en cualquier momento.
                            Los cambios serán notificados a través del Servicio o por correo electrónico.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">9. Contacto</h2>
                        <p>
                            Para cualquier pregunta sobre estos términos, contáctenos en:{' '}
                            <a href="mailto:contacto@omnibet.ai" className="text-emerald-400 hover:text-emerald-300">
                                contacto@omnibet.ai
                            </a>
                        </p>
                    </section>

                </div>

                {/* Back Button */}
                <div className="mt-16 pt-8 border-t border-slate-700">
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
