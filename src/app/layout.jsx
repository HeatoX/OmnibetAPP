import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import NewsFeed from "@/components/NewsFeed";

const inter = Inter({
    subsets: ["latin"],
    display: 'swap',
});

export const metadata = {
    title: "OmniBet AI - Predicciones Deportivas con Inteligencia Artificial",
    description: "La plataforma más avanzada de predicciones deportivas. Análisis con IA de Fútbol, NBA, MLB, NFL y Tenis con 70%+ de precisión. Datos en tiempo real.",
    keywords: "predicciones deportivas, apuestas, IA, inteligencia artificial, fútbol, NBA, MLB, NFL, tenis, pronósticos",
    authors: [{ name: "OmniBet AI" }],
    openGraph: {
        title: "OmniBet AI - Predicciones Deportivas con IA",
        description: "Análisis estadístico avanzado de 5 deportes mundiales con predicciones en tiempo real.",
        type: "website",
    },
};

export default function RootLayout({ children }) {
    const paypalOptions = {
        "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb",
        currency: "USD",
        intent: "capture",
    };

    return (
        <html lang="es">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className={inter.className}>
                <Providers paypalOptions={paypalOptions}>
                    <NewsFeed />
                    {children}
                </Providers>
            </body>
        </html>
    );
}

