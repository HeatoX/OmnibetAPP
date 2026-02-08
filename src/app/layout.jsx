import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AlertProvider } from "@/components/AlertContext";

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

import { SelectionProvider } from "@/context/SelectionContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { UIProvider } from "@/context/UIContext";

export default function RootLayout({ children }) {
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
                <AuthProvider>
                    <ProfileProvider>
                        <SubscriptionProvider>
                            <UIProvider>
                                <AlertProvider>
                                    <SelectionProvider>
                                        {children}
                                    </SelectionProvider>
                                </AlertProvider>
                            </UIProvider>
                        </SubscriptionProvider>
                    </ProfileProvider>
                </AuthProvider>
            </body>
        </html>
    );
}

