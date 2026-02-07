import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import NewsFeed from '@/components/NewsFeed';


export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased bg-slate-950 text-white min-h-screen">
        <AuthProvider>
          <NewsFeed />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

