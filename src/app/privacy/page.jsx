'use client';

import Link from 'next/link';

export default function PrivacyPage() {
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
                    Política de Privacidad
                </h1>

                <p style={{ color: '#64748b', marginBottom: '40px' }}>
                    Última actualización: Febrero 2026
                </p>

                <div style={{ color: '#cbd5e1', lineHeight: '1.8' }} className="space-y-8">

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Información que Recopilamos</h2>
                        <p className="mb-4">Recopilamos la siguiente información cuando utiliza nuestro servicio:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Información de cuenta:</strong> nombre, correo electrónico y contraseña encriptada.</li>
                            <li><strong>Datos de uso:</strong> historial de predicciones, preferencias deportivas y estadísticas.</li>
                            <li><strong>Información técnica:</strong> dirección IP, tipo de navegador y dispositivo.</li>
                            <li><strong>Datos de pago:</strong> procesados de forma segura por Stripe (no almacenamos datos de tarjeta).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Uso de la Información</h2>
                        <p className="mb-4">Utilizamos su información para:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Proporcionar y mejorar nuestro servicio de predicciones.</li>
                            <li>Personalizar su experiencia y recomendaciones.</li>
                            <li>Procesar transacciones y gestionar su suscripción.</li>
                            <li>Enviar comunicaciones importantes sobre el servicio.</li>
                            <li>Analizar el uso del servicio para mejoras continuas.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Protección de Datos</h2>
                        <p>
                            Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal,
                            incluyendo encriptación de datos, servidores seguros y acceso restringido. Sin embargo, ningún
                            sistema de transmisión por Internet es 100% seguro.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Compartir Información</h2>
                        <p className="mb-4">No vendemos ni compartimos su información personal excepto:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Con proveedores de servicios necesarios (ej. procesadores de pago).</li>
                            <li>Cuando sea requerido por ley o autoridades competentes.</li>
                            <li>Para proteger nuestros derechos legales.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Cookies y Tecnologías Similares</h2>
                        <p>
                            Utilizamos cookies para mantener su sesión, recordar preferencias y analizar el uso del servicio.
                            Puede configurar su navegador para rechazar cookies, pero esto puede afectar la funcionalidad del servicio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Sus Derechos</h2>
                        <p className="mb-4">Usted tiene derecho a:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Acceder a su información personal.</li>
                            <li>Rectificar datos incorrectos.</li>
                            <li>Solicitar la eliminación de su cuenta y datos.</li>
                            <li>Exportar sus datos en formato portable.</li>
                            <li>Oponerse al procesamiento de sus datos.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Retención de Datos</h2>
                        <p>
                            Conservamos su información mientras su cuenta esté activa. Al eliminar su cuenta,
                            sus datos personales serán eliminados en un plazo de 30 días, excepto aquellos que
                            debamos conservar por obligaciones legales.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Menores de Edad</h2>
                        <p>
                            Nuestro servicio está destinado exclusivamente a mayores de 18 años. No recopilamos
                            intencionalmente información de menores de edad.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">9. Contacto</h2>
                        <p>
                            Para ejercer sus derechos o consultas sobre privacidad, contáctenos en:{' '}
                            <a href="mailto:privacidad@omnibet.ai" className="text-emerald-400 hover:text-emerald-300">
                                privacidad@omnibet.ai
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
