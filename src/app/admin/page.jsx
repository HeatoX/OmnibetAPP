'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase-config';

// Admin emails that have access
const ADMIN_EMAILS = ['pablo@admin.com', 'admin@omnibet.ai'];

export default function AdminPage() {
    const router = useRouter();
    const { user, profile, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        freeUsers: 0,
        goldUsers: 0,
        diamondUsers: 0,
        monthlyRevenue: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
    });
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Check admin access
    const isAdmin = user && (ADMIN_EMAILS.includes(user.email) || profile?.is_admin);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        } else if (!loading && user && !isAdmin) {
            router.push('/app');
        }
    }, [user, loading, isAdmin, router]);

    useEffect(() => {
        if (isAdmin) {
            loadAdminData();
        }
    }, [isAdmin]);

    async function loadAdminData() {
        setIsLoadingData(true);
        try {
            // Load users (simulated for now - would need admin API)
            const mockUsers = [
                { id: 1, email: 'usuario1@test.com', name: 'Juan García', subscription_tier: 'gold', created_at: '2026-01-15', status: 'active', predictions_used: 45 },
                { id: 2, email: 'usuario2@test.com', name: 'María López', subscription_tier: 'diamond', created_at: '2026-01-18', status: 'active', predictions_used: 120 },
                { id: 3, email: 'usuario3@test.com', name: 'Carlos Rodríguez', subscription_tier: 'free', created_at: '2026-01-20', status: 'active', predictions_used: 2 },
                { id: 4, email: 'usuario4@test.com', name: 'Ana Martínez', subscription_tier: 'gold', created_at: '2026-01-22', status: 'blocked', predictions_used: 0 },
                { id: 5, email: 'usuario5@test.com', name: 'Pedro Sánchez', subscription_tier: 'free', created_at: '2026-01-25', status: 'active', predictions_used: 1 },
                { id: 6, email: 'usuario6@test.com', name: 'Laura Fernández', subscription_tier: 'diamond', created_at: '2026-01-28', status: 'active', predictions_used: 89 },
                { id: 7, email: 'nuevo@test.com', name: 'Nuevo Usuario', subscription_tier: 'free', created_at: '2026-02-01', status: 'active', predictions_used: 0 },
            ];
            setUsers(mockUsers);

            // Load purchases
            const mockPurchases = [
                { id: 1, user_email: 'usuario1@test.com', plan: 'gold', amount: 9.99, date: '2026-01-15', status: 'completed' },
                { id: 2, user_email: 'usuario2@test.com', plan: 'diamond', amount: 29.99, date: '2026-01-18', status: 'completed' },
                { id: 3, user_email: 'usuario4@test.com', plan: 'gold', amount: 9.99, date: '2026-01-22', status: 'refunded' },
                { id: 4, user_email: 'usuario6@test.com', plan: 'diamond', amount: 29.99, date: '2026-01-28', status: 'completed' },
                { id: 5, user_email: 'usuario1@test.com', plan: 'gold', amount: 9.99, date: '2026-02-01', status: 'completed' },
            ];
            setPurchases(mockPurchases);

            // Calculate stats
            const totalUsers = mockUsers.length;
            const freeUsers = mockUsers.filter(u => u.subscription_tier === 'free').length;
            const goldUsers = mockUsers.filter(u => u.subscription_tier === 'gold').length;
            const diamondUsers = mockUsers.filter(u => u.subscription_tier === 'diamond').length;
            const monthlyRevenue = mockPurchases
                .filter(p => p.status === 'completed' && p.date.startsWith('2026-02'))
                .reduce((sum, p) => sum + p.amount, 0);
            const totalRevenue = mockPurchases
                .filter(p => p.status === 'completed')
                .reduce((sum, p) => sum + p.amount, 0);

            setStats({
                totalUsers,
                freeUsers,
                goldUsers,
                diamondUsers,
                monthlyRevenue,
                totalRevenue,
                activeSubscriptions: goldUsers + diamondUsers,
            });

        } catch (error) {
            console.error('Error loading admin data:', error);
        }
        setIsLoadingData(false);
    }

    async function handleBlockUser(userId) {
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, status: u.status === 'blocked' ? 'active' : 'blocked' } : u
        ));
    }

    async function handleDeleteUser(userId) {
        if (confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
    }

    async function handleUpgradeUser(userId, newTier) {
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, subscription_tier: newTier } : u
        ));
    }

    // Filter users by search
    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || !user || !isAdmin) {
        return (
            <div className="min-h-screen bg-grid flex items-center justify-center">
                <div className="animate-spin text-6xl">⚙️</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-grid">
            <div className="bg-glow"></div>

            {/* Admin Header */}
            <header className="bg-black/80 backdrop-blur-xl border-b border-red-500/30 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 
                                          flex items-center justify-center text-xl font-bold text-white">
                                ⚙️
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Panel de Administración</h1>
                                <p className="text-sm text-gray-400">{user.email}</p>
                            </div>
                        </div>
                        <a href="/app" className="btn-secondary text-sm">
                            ← Volver a la App
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {[
                        { id: 'dashboard', label: '📊 Dashboard', },
                        { id: 'users', label: '👥 Usuarios', },
                        { id: 'purchases', label: '💳 Compras', },
                        { id: 'settings', label: '⚙️ Configuración', },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                label="Total Usuarios"
                                value={stats.totalUsers}
                                icon="👥"
                                color="cyan"
                            />
                            <StatCard
                                label="Suscripciones Activas"
                                value={stats.activeSubscriptions}
                                icon="⭐"
                                color="yellow"
                            />
                            <StatCard
                                label="Ingresos Este Mes"
                                value={`$${stats.monthlyRevenue.toFixed(2)}`}
                                icon="💰"
                                color="green"
                            />
                            <StatCard
                                label="Ingresos Totales"
                                value={`$${stats.totalRevenue.toFixed(2)}`}
                                icon="📈"
                                color="purple"
                            />
                        </div>

                        {/* User Distribution */}
                        <div className="glass-card p-6">
                            <h3 className="text-xl font-bold text-white mb-6">Distribución de Usuarios</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-gray-800/50 rounded-xl">
                                    <div className="text-4xl mb-2">🆓</div>
                                    <div className="text-3xl font-bold text-gray-400">{stats.freeUsers}</div>
                                    <div className="text-sm text-gray-500">Free</div>
                                </div>
                                <div className="text-center p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                                    <div className="text-4xl mb-2">⭐</div>
                                    <div className="text-3xl font-bold text-yellow-400">{stats.goldUsers}</div>
                                    <div className="text-sm text-gray-400">Gold</div>
                                </div>
                                <div className="text-center p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                                    <div className="text-4xl mb-2">💎</div>
                                    <div className="text-3xl font-bold text-cyan-400">{stats.diamondUsers}</div>
                                    <div className="text-sm text-gray-400">Diamond</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="glass-card p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Actividad Reciente</h3>
                            <div className="space-y-3">
                                {purchases.slice(0, 5).map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-2xl ${p.plan === 'diamond' ? '💎' : '⭐'}`}>
                                                {p.plan === 'diamond' ? '💎' : '⭐'}
                                            </span>
                                            <div>
                                                <div className="text-white">{p.user_email}</div>
                                                <div className="text-sm text-gray-400">{p.date}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-bold ${p.status === 'completed' ? 'text-green-400' : 'text-red-400'}`}>
                                                ${p.amount}
                                            </div>
                                            <div className={`text-xs ${p.status === 'completed' ? 'text-gray-400' : 'text-red-400'}`}>
                                                {p.status === 'completed' ? 'Completado' : 'Reembolsado'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        {/* Search */}
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Buscar usuarios..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
                            />
                            <button className="btn-primary">Exportar CSV</button>
                        </div>

                        {/* Users Table */}
                        <div className="glass-card overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-800/50">
                                    <tr>
                                        <th className="text-left p-4 text-gray-400 font-medium">Usuario</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Plan</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Estado</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Predicciones</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Registro</th>
                                        <th className="text-right p-4 text-gray-400 font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                                            <td className="p-4">
                                                <div>
                                                    <div className="text-white font-medium">{user.name}</div>
                                                    <div className="text-sm text-gray-400">{user.email}</div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.subscription_tier === 'diamond' ? 'bg-cyan-500/20 text-cyan-400' :
                                                    user.subscription_tier === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {user.subscription_tier.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {user.status === 'active' ? 'Activo' : 'Bloqueado'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-300">{user.predictions_used}</td>
                                            <td className="p-4 text-gray-400 text-sm">{user.created_at}</td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <select
                                                        value={user.subscription_tier}
                                                        onChange={(e) => handleUpgradeUser(user.id, e.target.value)}
                                                        className="bg-gray-700 text-white text-sm rounded px-2 py-1"
                                                    >
                                                        <option value="free">Free</option>
                                                        <option value="gold">Gold</option>
                                                        <option value="diamond">Diamond</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleBlockUser(user.id)}
                                                        className={`px-3 py-1 rounded text-sm ${user.status === 'blocked'
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-yellow-500/20 text-yellow-400'
                                                            }`}
                                                    >
                                                        {user.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="px-3 py-1 rounded text-sm bg-red-500/20 text-red-400"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Purchases Tab */}
                {activeTab === 'purchases' && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="glass-card p-6 text-center">
                                <div className="text-4xl font-bold text-green-400">${stats.monthlyRevenue.toFixed(2)}</div>
                                <div className="text-gray-400">Ingresos Febrero 2026</div>
                            </div>
                            <div className="glass-card p-6 text-center">
                                <div className="text-4xl font-bold text-cyan-400">{purchases.filter(p => p.status === 'completed').length}</div>
                                <div className="text-gray-400">Transacciones Exitosas</div>
                            </div>
                            <div className="glass-card p-6 text-center">
                                <div className="text-4xl font-bold text-red-400">{purchases.filter(p => p.status === 'refunded').length}</div>
                                <div className="text-gray-400">Reembolsos</div>
                            </div>
                        </div>

                        {/* Purchases Table */}
                        <div className="glass-card overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-800/50">
                                    <tr>
                                        <th className="text-left p-4 text-gray-400 font-medium">ID</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Usuario</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Plan</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Monto</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Fecha</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchases.map(purchase => (
                                        <tr key={purchase.id} className="border-t border-gray-800">
                                            <td className="p-4 text-gray-400">#{purchase.id}</td>
                                            <td className="p-4 text-white">{purchase.user_email}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${purchase.plan === 'diamond' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {purchase.plan.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-green-400 font-bold">${purchase.amount}</td>
                                            <td className="p-4 text-gray-400">{purchase.date}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${purchase.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {purchase.status === 'completed' ? 'Completado' : 'Reembolsado'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div className="glass-card p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Configuración General</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 mb-2">Predicciones Gratis por Mes</label>
                                    <input
                                        type="number"
                                        defaultValue={2}
                                        className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white w-32"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Precio Gold (USD)</label>
                                    <input
                                        type="number"
                                        defaultValue={9.99}
                                        step="0.01"
                                        className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white w-32"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Precio Diamond (USD)</label>
                                    <input
                                        type="number"
                                        defaultValue={29.99}
                                        step="0.01"
                                        className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white w-32"
                                    />
                                </div>
                                <button className="btn-primary mt-4">Guardar Cambios</button>
                            </div>
                        </div>

                        {/* God Mode */}
                        <div className="glass-card p-6 border border-yellow-500/30 bg-yellow-500/5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                                        ⚡ God Mode
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Habilita acceso total (Diamond) para tu cuenta de administrador sin pagar.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={profile?.subscription_tier === 'diamond'} onChange={(e) => {
                                        if (e.target.checked) {
                                            handleUpgradeUser(user.id, 'diamond');
                                            alert('¡God Mode activado! Ahora tienes acceso Diamond.');
                                        } else {
                                            handleUpgradeUser(user.id, 'free');
                                            alert('God Mode desactivado.');
                                        }
                                    }} />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                                </label>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Administradores</h3>
                            <div className="space-y-2">
                                {ADMIN_EMAILS.map(email => (
                                    <div key={email} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                        <span className="text-white">{email}</span>
                                        <span className="text-green-400 text-sm">Admin</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    const colors = {
        cyan: 'text-cyan-400',
        yellow: 'text-yellow-400',
        green: 'text-green-400',
        purple: 'text-purple-400',
        red: 'text-red-400',
    };

    return (
        <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-gray-400">{label}</span>
            </div>
            <div className={`text-3xl font-bold ${colors[color]}`}>{value}</div>
        </div>
    );
}
