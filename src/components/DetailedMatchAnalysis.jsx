'use client';

import { useState, useEffect } from 'react';
import { analyzeMatchDeep } from '@/lib/prediction-oracle';
import { getMatchDetails } from '@/lib/real-data-service';
import { getTeamHonours } from '@/lib/visuals-service';
import { generateAlphaNarrative } from '@/lib/narrative-engine';

import OddsComparison from './OddsComparison';
import SocialShareModal from './SocialShareModal';
import OmegaIndicator from './OmegaIndicator';
import StakeCalculator from './StakeCalculator';
import ScientificAudit from './ScientificAudit';
import { useAlerts } from './AlertContext';

/**
 * Detailed Match Analysis Component (UI v2.1 - Centered Broadcast Style)
 * Professional Dashboard with Real Data & Robust Empty States
 */
export default function DetailedMatchAnalysis({ match, onClose }) {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showScientificAudit, setShowScientificAudit] = useState(false);
    const [omegaData, setOmegaData] = useState(null);
    const [isRedundant, setIsRedundant] = useState(false);
    const { addAlert } = useAlerts();

    useEffect(() => {
        loadAnalysis();
    }, [match?.id]);

    async function loadAnalysis() {
        setLoading(true);
        try {
            console.log('📡 Calling getMatchDetails...');
            const fetchPromise = getMatchDetails(match.id, match.sport, match.leagueSlug);
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 4000));

            let data = null;
            try {
                data = await Promise.race([fetchPromise, timeoutPromise]);
            } catch (err) {
                console.warn("Backend fetch timed out or failed, falling back to direct client fetch...");
                data = { matchId: match.id, fallback: true };
            }

            if (!data || data.fallback || (!data.homeForm?.recentGames || data.homeForm.recentGames.length === 0)) {
                console.log("⚠️ Server data empty. Attempting DIRECT client fetch...");
                if (!data) data = { matchId: match.id };
                try {
                    const leagueMap = {
                        'Premier League': 'eng.1',
                        'LaLiga': 'esp.1',
                        'Bundesliga': 'ger.1',
                        'Serie A': 'ita.1',
                        'Ligue 1': 'fra.1',
                        'Eredivisie': 'ned.1',
                        'Primeira Liga': 'por.1',
                        'Champions League': 'uefa.champions',
                        'Europa League': 'uefa.europa',
                        'MLS': 'usa.1',
                        'Copa Libertadores': 'conmebol.libertadores',
                        'Copa Sudamericana': 'conmebol.sudamericana',
                        'Brasileirão': 'bra.1',
                        'Liga Profesional Argentina': 'arg.1',
                        'Primera A Colombia': 'col.1'
                    };

                    const mapped = leagueMap[match.league];
                    const candidates = [match.leagueSlug, mapped, 'eng.1', 'esp.1', 'ger.1', 'fra.1', 'ita.1', 'ned.1', 'por.1'].filter(Boolean);
                    const uniqueSlugs = [...new Set(candidates)];
                    const homeId = match.home.id;
                    const awayId = match.away.id;

                    const findDataWithSlugs = async (tid, type) => {
                        for (const s of uniqueSlugs) {
                            try {
                                const targetUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/${s}/teams/${tid}/${type}`;
                                const url = `/api/espn-proxy?url=${encodeURIComponent(targetUrl)}`;
                                const controller = new AbortController();
                                const timeoutId = setTimeout(() => controller.abort(), 1500);
                                const res = await fetch(url, { signal: controller.signal });
                                clearTimeout(timeoutId);
                                if (!res.ok) continue;
                                const d = await res.json();
                                if (type === 'schedule') {
                                    if (d.events && d.events.length > 0) return { slug: s, data: d.events };
                                } else if (type === 'roster') {
                                    if (d.athletes && d.athletes.length > 0) return { slug: s, data: d.athletes };
                                }
                            } catch (e) { }
                        }
                        return null;
                    };

                    const [homeSched, awaySched, homeRoster, awayRoster] = await Promise.all([
                        findDataWithSlugs(homeId, 'schedule'),
                        findDataWithSlugs(awayId, 'schedule'),
                        findDataWithSlugs(homeId, 'roster'),
                        findDataWithSlugs(awayId, 'roster')
                    ]);

                    const processEvents = (events, tid) => {
                        if (!events) return [];
                        return events.filter(e => e.competitions?.[0]?.status?.type?.completed)
                            .reverse().slice(0, 5).map(e => {
                                const c = e.competitions[0];
                                const isHome = c.competitors[0].team.id === tid;
                                const teamScore = isHome ? c.competitors[0].score?.value : c.competitors[1].score?.value;
                                const oppScore = isHome ? c.competitors[1].score?.value : c.competitors[0].score?.value;
                                let r = 'D';
                                if (teamScore > oppScore) r = 'W';
                                if (teamScore < oppScore) r = 'L';
                                return { date: e.date, opponent: c.competitors.find(x => x.team.id !== tid)?.team?.displayName, score: `${teamScore}-${oppScore}`, result: r };
                            });
                    };

                    if (homeSched?.data) data.homeForm = { ...data.homeForm, recentGames: processEvents(homeSched.data, homeId), debugLogs: [`Found via ${homeSched.slug}`] };
                    if (awaySched?.data) data.awayForm = { ...data.awayForm, recentGames: processEvents(awaySched.data, awayId) };

                    const processRoster = (athletes) => {
                        if (!athletes) return [];
                        const list = [];
                        athletes.forEach(g => g.items?.forEach(p => list.push({
                            id: p.id, fullName: p.fullName, displayName: p.displayName,
                            position: p.position?.name, jersey: p.jersey, headshot: p.headshot?.href
                        })));
                        return list;
                    };

                    if (!data.rosters) data.rosters = { home: [], away: [] };
                    if (homeRoster?.data) data.rosters.home = processRoster(homeRoster.data);
                    if (awayRoster?.data) data.rosters.away = processRoster(awayRoster.data);
                } catch (e) { console.error("Direct fetch failed", e); }
            }

            console.log('🔮 Calling analyzeMatchDeep...');
            const oracleTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Oracle Timeout')), 12000));
            let analysisResult = null;
            try {
                analysisResult = await Promise.race([analyzeMatchDeep(match), oracleTimeout]);
            } catch (err) {
                console.warn("⚠️ analyzeMatchDeep timed out or failed:", err);
                analysisResult = analysis;
            }

            if (analysisResult) {
                match.prediction = analysisResult.prediction;
                setIsRedundant(analysisResult.prediction.source === 'redundancy');
                setOmegaData({ score: analysisResult.prediction.omega || 0, singular: analysisResult.prediction.isOmegaSingular || false });
                if (analysisResult.prediction.marketHeat?.level === 'critical') {
                    addAlert({ match: `${match.home.name} vs ${match.away.name}`, value: '🔥 SHARK', reason: analysisResult.prediction.marketHeat.message });
                }
            }
            setAnalysis(prev => analysisResult || prev);
        } catch (error) {
            console.error('💥 Error loading analysis:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="fixed inset-0 bg-[#0a0a0f]/95 backdrop-blur-xl z-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-300 font-medium tracking-wide">ANALIZANDO DATOS EN VIVO...</p>
                </div>
            </div>
        );
    }

    const { homeForm, awayForm, h2h, rosters, leaders, venue, officials } = analysis || {};
    const swarmInsights = match.prediction?.swarmInsights || [];
    const weather = match.prediction?.weather;
    const isCupMatch = !homeForm?.standing && !awayForm?.standing;

    return (
        <div className="fixed inset-0 bg-[#0a0a0f] z-40 overflow-y-auto animate-fadeIn pb-32" style={{ paddingTop: '180px' }}>
            {/* 10% Layout Wrapper */}
            <div className="w-full mx-auto flex flex-col items-center" style={{ paddingLeft: '10%', paddingRight: '10%' }}>

                {/* BROADCAST HEADER */}
                <div className="relative w-full h-[400px] overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-cover bg-center" style={{
                        backgroundImage: `url(${venue?.images?.[0] || '/assets/stadium-generic.jpg'})`,
                        filter: 'grayscale(60%) brightness(30%) blur(2px)'
                    }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent"></div>

                    {/* Navbar */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 w-full max-w-7xl mx-auto">
                        <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                            <span className={`w-2 h-2 rounded-full animate-pulse ${omegaData?.singular ? 'bg-amber-400' : (isRedundant ? 'bg-blue-400' : 'bg-red-500')}`}></span>
                            <span className={`text-xs font-bold tracking-widest uppercase ${omegaData?.singular ? 'text-amber-400' : 'text-white'}`}>
                                {omegaData?.singular ? 'Ω OMEGA SINGULARITY DETECTED' : (isRedundant ? '🛡️ DATA REDUNDANCY ACTIVE' : 'Live Analysis')}
                            </span>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-md transition-all">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Scoreboard */}
                    <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 mt-8">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
                            {/* Home */}
                            <div className="flex flex-col items-center flex-1 text-center">
                                {match.home.logo ? <img src={match.home.logo} alt={match.home.name} className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]" /> : <div className="text-6xl">🏠</div>}
                                <h1 className="text-2xl md:text-4xl font-black text-white mt-4">{match.home.name}</h1>
                                {match.prediction?.oracleV12?.homeState && (
                                    <div className="mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ backgroundColor: `${match.prediction.oracleV12.homeState.color}20`, color: match.prediction.oracleV12.homeState.color, border: `1px solid ${match.prediction.oracleV12.homeState.color}40` }}>
                                        <span className="text-sm">{match.prediction.oracleV12.homeState.icon}</span>{match.prediction.oracleV12.homeState.label}
                                    </div>
                                )}
                                <div className="mt-3 flex gap-1 justify-center"><FormBubbles form={homeForm?.recentGames} /></div>
                            </div>

                            {/* Center */}
                            <div className="flex flex-col items-center justify-center min-w-[180px]">
                                <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold uppercase tracking-wider mb-4 shadow-lg">{match.league}</div>
                                <div className="text-5xl md:text-7xl font-black text-white/90 tracking-tighter mb-2">{match.isLive ? `${match.home.score} - ${match.away.score}` : 'VS'}</div>
                                <div className="text-cyan-400 font-bold uppercase text-sm tracking-wide mb-1">{match.isLive ? match.liveMinute || 'EN VIVO' : match.displayDate}</div>
                                <div className="text-gray-400 text-xs">{match.isLive ? 'Minuto a minuto' : match.startTime}</div>
                            </div>

                            {/* Away */}
                            <div className="flex flex-col items-center flex-1 text-center">
                                {match.away.logo ? <img src={match.away.logo} alt={match.away.name} className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]" /> : <div className="text-6xl">✈️</div>}
                                <h1 className="text-2xl md:text-4xl font-black text-white mt-4">{match.away.name}</h1>
                                {match.prediction?.oracleV12?.awayState && (
                                    <div className="mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ backgroundColor: `${match.prediction.oracleV12.awayState.color}20`, color: match.prediction.oracleV12.awayState.color, border: `1px solid ${match.prediction.oracleV12.awayState.color}40` }}>
                                        <span className="text-sm">{match.prediction.oracleV12.awayState.icon}</span>{match.prediction.oracleV12.awayState.label}
                                    </div>
                                )}
                                <div className="mt-3 flex gap-1 justify-center"><FormBubbles form={awayForm?.recentGames} /></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT CONTAINER */}
                <div className="w-full max-w-5xl -mt-24 relative z-20 pb-40">
                    <div className="w-full mb-8"><OmegaIndicator omegaData={omegaData} /></div>

                    {/* 1. NEURAL SWARM BANNER */}
                    <div className="w-full mb-12 flex justify-center">
                        <div className="w-full">
                            <div className="bg-[#151725]/80 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 overflow-hidden">
                                <div className="bg-[#0f111a] rounded-[22px] p-6 flex flex-col lg:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl shadow-xl flex-shrink-0">🧠</div>
                                        <div>
                                            <h3 className="text-white font-bold text-xl tracking-tight flex items-center gap-2">
                                                <span className="animate-pulse">👁️</span> OmniBet Oracle V12.0
                                            </h3>
                                            <div className="text-gray-400 text-sm">
                                                {swarmInsights.length > 0 ? <span className="text-cyan-300">Detectados {swarmInsights.length} factores anómalos</span> : <span>Análisis de patrones estándar</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-4 items-center">
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            {match.prediction?.isValueBet && <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 animate-bounce"><span className="text-green-400 font-bold">💎 VALOR</span></div>}
                                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                                                <span className="text-gray-400 text-xs font-bold uppercase">Confidence</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${match.prediction?.confidence === 'diamond' ? 'bg-cyan-500 text-black' : match.prediction?.confidence === 'gold' ? 'bg-yellow-500 text-black' : 'bg-gray-500 text-white'}`}>{match.prediction?.confidence || 'Verifying'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAB */}
                    <div className="fixed bottom-8 right-8 z-50">
                        <button onClick={() => setShowShareModal(true)} className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </button>
                    </div>

                    {/* Tabs - Ultra Stable V30 */}
                    <div className="flex justify-center mb-16 w-full px-4">
                        <div className="bg-[#151725]/60 backdrop-blur-3xl p-1.5 rounded-full flex items-center gap-2 border border-white/5 shadow-2xl overflow-x-auto no-scrollbar max-w-full">
                            {[
                                { id: 'overview', icon: '📈', label: 'Resumen' },
                                { id: 'stats', icon: '📊', label: 'Estadísticas' },
                                { id: 'supreme', icon: '🌌', label: 'Supremo' }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className={`px-6 py-3 rounded-full text-xs font-black transition-all flex items-center gap-3 whitespace-nowrap uppercase tracking-normal ${activeTab === t.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span className="text-xl leading-none">{t.icon}</span>
                                    <span>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="animate-slideUp space-y-12 pb-20 w-full">
                        {/* 1. OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Alpha Narrative (V50.5 Highlight) */}
                                <div className="p-6 bg-slate-900/50 rounded-2xl border border-emerald-500/30 backdrop-blur-md relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                        <div className="text-4xl">🔱</div>
                                    </div>
                                    <h3 className="text-emerald-400 font-black text-lg mb-3 flex items-center gap-2">
                                        <span className="animate-pulse">🔥</span> ALPHA INSIGHT: EL "POR QUÉ" DEL ORÁCULO
                                    </h3>
                                    <div className="text-slate-200 leading-relaxed font-medium italic">
                                        {generateAlphaNarrative(match, analysis)}
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-cyan-600 to-blue-700 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 text-center">
                                    <h3 className="text-white font-bold text-lg">Matrix Scientific Audit (V26)</h3>
                                    <button onClick={() => setShowScientificAudit(true)} className="w-full py-3 bg-white text-blue-900 font-black rounded-xl hover:scale-105 transition-transform uppercase">Iniciar Auditoría</button>
                                </div>
                                <StakeCalculator initialOdds={match.prediction?.odds ?? null} initialConfidence={match.prediction?.numericConfidence ?? 50} />
                                <OddsComparison bookmakers={analysis?.bookmakers || []} prediction={match.prediction} />
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="space-y-6">
                                        <ContextCard weather={weather} venue={venue} referee={match.referee || officials?.[0]} sport={match.sport} />
                                        <TeamHonoursCard teamName={match.home.name} side="Local" />
                                        <TeamHonoursCard teamName={match.away.name} side="Visitante" />
                                        <LeagueStandingCard homeForm={homeForm} awayForm={awayForm} league={match.league} isCup={isCupMatch} sport={match.sport} />
                                    </div>
                                    <div className="lg:col-span-2 space-y-6">
                                        {leaders?.home && leaders?.away ? (
                                            <div className="bg-[#151725] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                                                <h3 className="text-gray-300 font-bold text-sm uppercase mb-6">🔥 Duelo de Figuras</h3>
                                                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                                    <PlayerSpotlight player={leaders.home[0]} side="left" color="cyan" team={match.home.name} />
                                                    <div className="text-gray-600 text-4xl font-black opacity-30">VS</div>
                                                    <PlayerSpotlight player={leaders.away[0]} side="right" color="purple" team={match.away.name} />
                                                </div>
                                            </div>
                                        ) : <div className="bg-[#151725] border border-white/5 rounded-2xl p-6 text-center text-gray-500">Datos de figuras no disponibles.</div>}
                                        <HeadToHeadList h2h={h2h} homeId={match.home.id} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'stats' && <div className="grid md:grid-cols-2 gap-8"><FormTab homeForm={homeForm} awayForm={awayForm} /></div>}

                        {activeTab === 'roster' && (
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <TeamRosterList roster={rosters?.home} teamName={match.home.name} headerColor="cyan" />
                                    <InjuryList injuries={analysis?.injuries?.home} teamName={match.home.name} />
                                </div>
                                <div className="space-y-6">
                                    <TeamRosterList roster={rosters?.away} teamName={match.away.name} headerColor="purple" />
                                    <InjuryList injuries={analysis?.injuries?.away} teamName={match.away.name} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'tools' && (
                            <div className="max-w-4xl mx-auto space-y-10">
                                {/* This content was moved to the overview tab */}
                            </div>
                        )}

                        {activeTab === 'supreme' && (
                            analysis?.supremeVerdict ? (
                                <div className="animate-fadeIn space-y-6">
                                    <div className="bg-gradient-to-r from-purple-900/40 to-black/40 border border-purple-500/30 rounded-2xl p-6"><h3 className="text-purple-400 font-black uppercase flex items-center gap-3">🌌 Capa Supremo V30</h3></div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-5">
                                            <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Marcadores Probables</h4>
                                            <div className="space-y-3">{analysis.supremeVerdict.likelyScores.map((s, idx) => <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5"><span className="text-white font-mono text-lg">{s.score}</span><span className="text-purple-400 font-bold">{s.prob}%</span></div>)}</div>
                                        </div>
                                        <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-5">
                                            <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Filtro Bayesian</h4>
                                            <div className="space-y-4">
                                                {['home', 'draw', 'away'].map(k => <div key={k} className="flex justify-between items-center text-sm"><span className="text-gray-400 capitalize">{k}</span><span className="text-white font-bold">{analysis.supremeVerdict.bayesianProbs[k]}%</span></div>)}
                                            </div>
                                        </div>
                                        <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-5">
                                            <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Vortex Force</h4>
                                            <div className="space-y-4"><div className="flex justify-between items-center text-xs"><span className="text-gray-400">Intensidad</span><span className="text-white">{analysis.supremeVerdict.vortexForce.force}%</span></div><div className="h-1.5 bg-gray-800 rounded-full"><div className="h-full bg-purple-500" style={{ width: `${analysis.supremeVerdict.vortexForce.force}%` }}></div></div><div className="text-xs text-center p-2 text-gray-400 italic">{analysis.supremeVerdict.vortexForce.message}</div></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                    <div className="text-5xl mb-4">🌌</div>
                                    <h3 className="text-purple-400 font-black uppercase tracking-widest">Sincronizando Capa Supremo...</h3>
                                    <p className="text-gray-500 text-sm mt-2">Deduciendo veredictos probabilísticos complejos</p>
                                </div>
                            )
                        )}
                        {/* TAB CONTENT: SUPREME (V50.0 OBSERVER PROTOCOL) */}
                        {activeTab === 'supreme' && (
                            <div className="space-y-8 animate-fadeIn">
                                {/* Sentinel Header */}
                                <div className="bg-gradient-to-r from-cyan-900/60 via-blue-900/40 to-purple-900/60 border border-cyan-400/30 rounded-3xl p-8 text-center relative overflow-hidden group">
                                    <div className="absolute inset-0 opacity-10 animate-pulse" style={{ backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                    <div className="relative z-10">
                                        <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-black tracking-[0.2em] uppercase mb-4 inline-block border border-cyan-400/30">Protocolo Observador Activo</span>
                                        <h2 className="text-4xl font-black text-white tracking-tighter mb-2 italic">ORÁCULO SENTIENTE V50.0</h2>
                                        <p className="text-gray-400 text-xs font-mono tracking-widest uppercase">Evolución Autónoma: Nivel Sentinel</p>
                                    </div>
                                </div>

                                {/* Sentinel Market Prediction */}
                                <div className="bg-[#151725]/60 border border-cyan-500/20 rounded-3xl p-8 relative overflow-hidden">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="flex-1">
                                            <h3 className="text-cyan-400 font-bold text-lg mb-2 flex items-center gap-2">
                                                👁️ Quantum Sentinel: Deriva de Mercado
                                            </h3>
                                            <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                                El Observador anticipa el movimiento de las cuotas basándose en el flujo de capital proyectado y la inercia institucional.
                                            </p>
                                            <div className="flex gap-4">
                                                <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${match.prediction?.sentinel?.advice === 'BET_NOW' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                                                    <span className="font-black animate-pulse">●</span>
                                                    <span className="text-xs font-bold uppercase tracking-widest">{match.prediction?.sentinel?.advice === 'BET_NOW' ? 'BET NOW' : 'WAIT FOR VALUE'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-black/40 p-6 rounded-2xl border border-white/5 text-right min-w-[200px]">
                                            <div className="text-[10px] text-cyan-400 font-mono mb-1 uppercase tracking-widest">Confianza Digital</div>
                                            <div className="text-4xl font-black text-white">{match.prediction?.sentinel?.confidence}%</div>
                                            <div className="text-[10px] text-gray-500 italic mt-2">LSTM Predictions Injected</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Narrative & Human Factor */}
                                {match.prediction?.narrative?.factors?.length > 0 && (
                                    <div className="bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/20 rounded-3xl p-8 group">
                                        <h3 className="text-purple-400 font-bold text-lg mb-6 flex items-center gap-2">
                                            🎭 Motor Narrativo (Grudge & Glory)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {match.prediction.narrative.factors.map((f, i) => (
                                                <div key={i} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-purple-500/30 transition-all">
                                                    <div className="text-3xl">{f.icon}</div>
                                                    <div>
                                                        <div className="text-xs font-black text-white uppercase">{f.label}</div>
                                                        <div className="text-[10px] text-gray-400">{f.detail}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* V40 Components (Now as sub-layers of V50) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Tactical Matchup ADN */}
                                    <div className="bg-[#151725]/60 border border-white/5 rounded-3xl p-6">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 italic opacity-50">🧬 Capa Táctica V40</h3>
                                        <div className="flex flex-col gap-6">
                                            <div className="flex justify-between items-center">
                                                <div className="text-center flex-1">
                                                    <div className="text-2xl mb-2">🛡️</div>
                                                    <div className="text-white font-bold">{match.prediction?.quantum?.homeADN}</div>
                                                </div>
                                                <div className="text-2xl font-black text-purple-500 animate-pulse">VS</div>
                                                <div className="text-center flex-1">
                                                    <div className="text-2xl mb-2">⚔️</div>
                                                    <div className="text-white font-bold">{match.prediction?.quantum?.awayADN}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Graph Connectivity */}
                                    <div className="bg-[#151725]/60 border border-white/5 rounded-3xl p-6">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 italic opacity-50">🕸️ Capa de Grafo V40</h3>
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <div className="relative w-24 h-24 mb-4">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                                                    <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent"
                                                        className={match.prediction?.quantum?.isFragmented ? 'text-red-500' : 'text-cyan-400'}
                                                        strokeDasharray={264}
                                                        strokeDashoffset={264 - (264 * (match.prediction?.quantum?.graphStability || 1))}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-lg font-black text-white">{Math.round((match.prediction?.quantum?.graphStability || 1) * 100)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Risk Management (V50 Optimized) */}
                                <div className="bg-gradient-to-br from-[#0c1a15] to-[#0a0a0f] border border-emerald-500/30 rounded-3xl p-8">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="max-w-md">
                                            <h3 className="text-emerald-400 font-bold text-xl mb-4 flex items-center gap-2">
                                                ⚖️ Quantum Risk Management (V50 Policy)
                                            </h3>
                                            <div className="flex gap-4">
                                                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                                    <div className="text-[10px] text-emerald-400 font-mono">AUTONOMY</div>
                                                    <div className="text-white font-black">RL-ACTIVE</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-black/40 p-8 rounded-2xl border border-white/5 text-center min-w-[280px]">
                                            <div className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-4">Recomendación Sentinel</div>
                                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 mb-2">
                                                {match.prediction?.quantum?.kellyRecommendation}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* ALPHA SANDBOX TAB (V50.5) */}
                        {activeTab === 'sandbox' && (
                            <div className="animate-in zoom-in-95 duration-500 space-y-8">
                                <div className="p-10 text-center bg-slate-900/80 rounded-3xl border-2 border-cyan-500/40 shadow-[0_0_40px_rgba(34,211,238,0.15)] backdrop-blur-xl">
                                    <div className="text-6xl mb-6">🧪</div>
                                    <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Alpha Simulation Sandbox</h2>
                                    <p className="text-cyan-400 font-bold mb-10 max-w-lg mx-auto leading-relaxed">
                                        Modifica las variables en tiempo real y observa cómo reacciona el cerebro del Oráculo.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
                                        <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-400/50 transition-all cursor-not-allowed opacity-75">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="font-bold text-white">Factor Climático</span>
                                                <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-400">PRÓXIMAMENTE</span>
                                            </div>
                                            <p className="text-xs text-slate-400">¿Y si llueve torrencialmente? El Oráculo ajustará el factor técnico.</p>
                                        </div>
                                        <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-400/50 transition-all cursor-not-allowed opacity-75">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="font-bold text-white">Baja de Estrella</span>
                                                <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-400">PRÓXIMAMENTE</span>
                                            </div>
                                            <p className="text-xs text-slate-400">Simula la ausencia del máximo goleador o asistente.</p>
                                        </div>
                                        <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-400/50 transition-all cursor-not-allowed opacity-75 col-span-full">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="font-bold text-white">Vortex Force Override</span>
                                                <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-400">CONTROL DE ÉLITE</span>
                                            </div>
                                            <p className="text-xs text-slate-400">Ajusta manualmente la intensidad de racha percibida para forzar un análisis de "Upset".</p>
                                        </div>
                                    </div>

                                    <div className="mt-12 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                                        <div className="text-xs font-mono text-cyan-500 mb-2 uppercase tracking-widest animate-pulse">Alpha System Status</div>
                                        <div className="text-sm text-slate-400 italic">"Simulador en fase beta. Mejora tu plan a Diamond para acceso prioritario a la v2.0."</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Overlay Modals */}
                    {selectedPlayer && <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
                    {showShareModal && <SocialShareModal prediction={match.prediction} match={match} onClose={() => setShowShareModal(false)} />}
                    {showScientificAudit && <ScientificAudit match={match} analysis={analysis} onClose={() => setShowScientificAudit(false)} />}

                </div>
            </div>
        </div>
    );
}

/* ================= WIDGET COMPONENTS ================= */

function ContextCard({ weather, venue, referee, sport }) {
    const isIndoor = sport === 'basketball' || sport === 'nba';
    return (
        <div className="bg-[#151725]/80 border border-white/5 backdrop-blur-md rounded-2xl shadow-xl p-5">
            <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Contexto del Juego</h3>
            <div className="space-y-4">
                {!isIndoor && (
                    <div className="flex items-start gap-3">
                        <div className="text-2xl pt-1">{weather?.condition === 'Rain' ? '🌧️' : '☀️'}</div>
                        <div><div className="text-white font-bold">{weather?.temp || '20'}°C</div><div className="text-xs text-gray-500 uppercase">{weather?.condition || 'Normal'}</div></div>
                    </div>
                )}
                <div className="flex items-start gap-3"><div className="text-2xl pt-1">⚖️</div><div><div className="text-white font-bold">{referee || 'Por designar'}</div><div className="text-xs text-gray-500">Oficial</div></div></div>
                <div className="flex items-start gap-3"><div className="text-2xl pt-1">{isIndoor ? '🏟️' : '🌱'}</div><div><div className="text-white font-bold">{venue?.name || 'Estadio'}</div><div className="text-xs text-gray-500">{venue?.city}</div></div></div>
            </div>
        </div>
    );
}

function LeagueStandingCard({ homeForm, awayForm, league, isCup, sport }) {
    if (isCup || !homeForm?.standing) return (
        <div className="bg-[#151725]/80 border border-white/5 rounded-2xl p-5 text-center">
            <div className="text-4xl mb-2">🏆</div><div className="text-white font-bold">{league}</div><div className="text-xs text-gray-500">Eliminatoria</div>
        </div>
    );
    return (
        <div className="bg-[#151725]/80 border border-white/5 rounded-2xl p-5">
            <h3 className="text-gray-300 font-bold text-sm uppercase mb-4">🏆 Tabla {league}</h3>
            <div className="space-y-2">
                <StandingRow team={homeForm.team} rank={homeForm.standing.rank} points={homeForm.standing.points} highlight color="cyan" />
                <StandingRow team={awayForm.team} rank={awayForm.standing.rank} points={awayForm.standing.points} highlight color="purple" />
            </div>
        </div>
    );
}

function StandingRow({ team, rank, points, highlight, color }) {
    const borderColor = color === 'cyan' ? 'border-cyan-500' : 'border-purple-500';
    return (
        <div className={`flex items-center justify-between p-3 rounded-lg ${highlight ? `bg-white/5 border-l-2 ${borderColor}` : 'bg-white/5'}`}>
            <div className="flex items-center gap-3"><span className="w-6 h-6 flex items-center justify-center bg-gray-700 text-[10px] font-bold rounded text-white shadow">#{rank}</span><span className="text-white font-medium text-sm truncate">{team}</span></div>
            <span className={`font-bold ${color === 'cyan' ? 'text-cyan-400' : 'text-purple-400'}`}>{points} pts</span>
        </div>
    );
}

function FormBubbles({ form }) {
    if (!form || form.length === 0) return null;
    return form.slice(0, 5).map((game, i) => (
        <div key={i} className={`w-3 h-3 rounded-full ${game.result === 'W' ? 'bg-green-500 shadow-lg' : game.result === 'L' ? 'bg-red-500' : 'bg-gray-500'} border border-white/10`} title={`${game.result} vs ${game.opponent}`}></div>
    ));
}

function PlayerSpotlight({ player, side, color, team }) {
    if (!player) return null;
    return (
        <div className={`flex items-center gap-4 ${side === 'right' ? 'flex-row-reverse text-right' : ''}`}>
            <div className={`w-16 h-16 rounded-full border-2 p-0.5 ${color === 'cyan' ? 'border-cyan-400' : 'border-red-500'}`}><img src={player.headshot || "https://a.espncdn.com/combiner/i?img=/i/headshots/nophoto.png"} alt={player.leader} className="w-full h-full rounded-full object-cover" /></div>
            <div><div className="text-white font-bold leading-tight">{player.leader}</div><div className="text-[10px] text-gray-400 uppercase">{player.name}</div><div className={`text-2xl font-black ${color === 'cyan' ? 'text-cyan-400' : 'text-red-500'}`}>{player.value}</div></div>
        </div>
    );
}

function HeadToHeadList({ h2h, homeId }) {
    return (
        <div className="bg-[#151725] border border-white/5 rounded-2xl p-6 h-full">
            <h3 className="text-gray-300 font-bold text-sm uppercase mb-5">⚔️ Historial Directo</h3>
            <div className="space-y-3">
                {h2h && h2h.length > 0 ? h2h.slice(0, 5).map((game, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-transparent hover:border-white/10 group">
                        <div className="text-gray-500 text-[10px] w-20">{new Date(game.date).toLocaleDateString()}</div>
                        <div className="flex-1 flex items-center justify-center gap-4">
                            <span className="text-sm text-gray-300">{game.homeTeam}</span>
                            <span className="bg-black/40 px-3 py-1 rounded text-cyan-400 font-bold font-mono">{game.score}</span>
                            <span className="text-sm text-gray-300">{game.awayTeam}</span>
                        </div>
                    </div>
                )) : <div className="text-gray-500 text-sm py-10 text-center">No hay registros previos.</div>}
            </div>
        </div>
    );
}

function RosterItem({ p }) {
    const [img, setImg] = useState(p.headshot);
    return (
        <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group">
            <div className="text-gray-600 text-[10px] font-mono w-6">#{p.jersey}</div>
            <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden border border-white/10"><img src={img || "https://a.espncdn.com/combiner/i?img=/i/headshots/nophoto.png"} alt={p.displayName} className="w-full h-full object-cover" /></div>
            <div className="min-w-0"><div className="text-white text-xs font-medium truncate">{p.displayName}</div><div className="text-gray-500 text-[9px] uppercase tracking-widest">{p.position}</div></div>
        </div>
    );
}

function TeamRosterList({ roster, teamName, headerColor = 'gray' }) {
    if (!roster || roster.length === 0) return <div className="bg-[#151725] border border-white/5 rounded-2xl p-6 text-center text-gray-500">Alineación no disponible.</div>;
    return (
        <div className={`bg-[#151725] border border-white/5 rounded-2xl p-6 h-full border-t-4 border-t-${headerColor}-500 flex flex-col`}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-gray-300 font-bold text-sm uppercase">{teamName}</h3><span className="bg-white/5 text-gray-400 text-[9px] px-2 py-1 rounded-full">{roster.length} Jugadores</span></div>
            <div className="grid grid-cols-1 gap-1 overflow-y-auto custom-scrollbar flex-1">{roster.map((p, i) => <RosterItem key={p.id || i} p={p} />)}</div>
        </div>
    );
}

function InjuryList({ injuries, teamName }) {
    if (!injuries || injuries.length === 0) return null;
    return (
        <div className="bg-[#151725] border border-red-500/20 rounded-2xl p-5 mt-4">
            <h3 className="text-red-400 font-bold text-xs uppercase mb-4 flex items-center gap-2">🚑 Reporte Médico - {teamName}</h3>
            <div className="space-y-2">
                {injuries.map((inj, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-red-500/5 rounded-lg border border-red-500/10">
                        <div className="text-white text-xs font-bold">{inj.athlete?.displayName}</div>
                        <div className="text-red-300 text-[10px] ml-auto">{inj.status?.assessment}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FormTab({ homeForm, awayForm }) {
    return <><FormCard form={homeForm} /><FormCard form={awayForm} /></>;
}

function FormCard({ form }) {
    return (
        <div className="bg-[#151725] border border-white/5 rounded-2xl p-6 bg-gradient-to-b from-[#1a1c29] to-[#151725]">
            <h3 className="text-lg font-bold text-white mb-4">{form?.team}</h3>
            <div className="space-y-3">
                {form?.recentGames?.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className={`w-8 h-8 flex items-center justify-center rounded font-black text-xs ${m.result === 'W' ? 'bg-green-500' : m.result === 'L' ? 'bg-red-500' : 'bg-gray-500'} text-white`}>{m.result}</span>
                        <div className="flex-1 min-w-0"><div className="text-white text-sm font-bold truncate">{m.opponent}</div><div className="text-gray-500 text-[9px]">{new Date(m.date).toLocaleDateString()}</div></div>
                        <div className="text-lg font-black text-white font-mono">{m.score}</div>
                    </div>
                )) || <p className="text-gray-500 text-sm italic py-4">Sin datos recientes.</p>}
            </div>
        </div>
    );
}

function PlayerDetailModal({ player, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-[#1a1c29] border border-white/10 rounded-2xl max-w-lg w-full p-6 relative animate-fadeIn shadow-2xl overflow-y-auto max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">×</button>
                <div className="flex items-center gap-5 mb-6">
                    <div className="w-24 h-24 bg-gray-800 rounded-full overflow-hidden border-4 border-cyan-500/20 shadow-xl"><img src={player.headshot || "https://a.espncdn.com/combiner/i?img=/i/headshots/nophoto.png"} alt={player.displayName} className="w-full h-full object-cover" /></div>
                    <div><h2 className="text-2xl font-bold text-white tracking-tight">{player.displayName}</h2><div className="flex items-center gap-2 mt-1"><span className="bg-white/10 px-2 py-0.5 rounded text-gray-300 font-mono text-sm">#{player.jersey}</span><span className="text-cyan-400 font-medium text-sm">{player.position}</span></div></div>
                </div>
                {player.stats && player.stats.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {player.stats.map((s, i) => <div key={i} className="bg-black/20 p-4 rounded-xl border border-white/5 text-center"><div className="text-xl font-bold text-white">{s.displayValue}</div><div className="text-[10px] text-gray-400 uppercase mt-1">{s.displayName}</div></div>)}
                    </div>
                ) : <div className="py-8 text-center text-gray-500 italic">Sin estadísticas detalladas.</div>}
            </div>
        </div>
    );
}

function TeamHonoursCard({ teamName, side }) {
    const [honours, setHonours] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!teamName) return;
            setLoading(true);
            try {
                const data = await getTeamHonours(teamName);
                if (data && Array.isArray(data)) setHonours(data.slice(0, 3));
            } catch (e) { }
            setLoading(false);
        }
        load();
    }, [teamName]);

    if (!loading && (!honours || honours.length === 0)) return null;

    return (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 relative group">
            <div className="flex items-center justify-between mb-3"><h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">🏆 Vitrina {side}</h4>{loading && <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}</div>
            <div className="space-y-2">{honours.map((h, i) => <div key={i} className="flex items-center gap-3 animate-fadeIn"><div className="bg-yellow-500/20 text-yellow-500 w-6 h-6 rounded flex items-center justify-center text-xs">🥇</div><div><div className="text-[10px] font-bold text-white leading-tight">{h.strHonour}</div><div className="text-[8px] text-gray-500">{h.strSeason}</div></div></div>)}</div>
        </div>
    );
}
