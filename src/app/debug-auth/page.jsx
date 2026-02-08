'use client';

import { useState, useEffect } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase-config';

export default function DebugAuthPage() {
    const [status, setStatus] = useState('Checking...');
    const [env, setEnv] = useState({});
    const [session, setSession] = useState(null);

    useEffect(() => {
        const check = async () => {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            setEnv({
                url: supabaseUrl ? 'Defined' : 'UNDEFINED',
                key: supabaseAnonKey ? 'Defined' : 'UNDEFINED',
                isDemo: isDemoMode ? 'YES' : 'NO'
            });

            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;
                setSession(data.session);
                setStatus('Ready');
            } catch (err) {
                setStatus('Error: ' + err.message);
            }
        };
        check();
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-10 font-mono">
            <h1 className="text-3xl font-bold mb-10 text-emerald-400">🔍 OmniBet Auth Debug</h1>

            <div className="space-y-8 max-w-2xl">
                <section className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                    <h2 className="text-xl font-bold mb-4">Environment Keys</h2>
                    <p>SUPABASE_URL: <span className={env.url === 'Defined' ? 'text-green-400' : 'text-red-400'}>{env.url}</span></p>
                    <p>SUPABASE_KEY: <span className={env.key === 'Defined' ? 'text-green-400' : 'text-red-400'}>{env.key}</span></p>
                    <p>Demo Mode: <span className="text-yellow-400">{env.isDemo}</span></p>
                </section>

                <section className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                    <h2 className="text-xl font-bold mb-4">Auth Status</h2>
                    <p>Status: {status}</p>
                    <p>User ID: {session?.user?.id || 'NO SESSION'}</p>
                    <p>User Email: {session?.user?.email || 'N/A'}</p>
                </section>

                <div className="pt-10">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-500 font-bold"
                    >
                        Volver a Inicio
                    </button>
                </div>
            </div>
        </div>
    );
}
