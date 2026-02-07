'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PlayerAnalysisCard, { AIAnalysisSummary } from '@/components/PlayerAnalysis';
import OddsComparison from '@/components/OddsComparison';
import WeatherWidget from '@/components/WeatherWidget';
import { SPORTS, DEPORTES } from '@/lib/mock-data';

export default function AnalysisPage() {
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [analysisResults, setAnalysisResults] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');

    const sampleMatches = [
        { id: 1, homeTeam: 'Real Madrid', awayTeam: 'Barcelona', league: 'LaLiga', time: '21:00', city: 'Madrid', venue: 'Santiago Bernabéu' },
        { id: 2, homeTeam: 'Manchester City', awayTeam: 'Liverpool', league: 'Premier League', time: '17:30', city: 'Manchester', venue: 'Etihad Stadium' },
        { id: 3, homeTeam: 'Bayern Munich', awayTeam: 'Dortmund', league: 'Bundesliga', time: '18:30', city: 'Munich', venue: 'Allianz Arena' },
        { id: 4, homeTeam: 'PSG', awayTeam: 'Marseille', league: 'Ligue 1', time: '21:00', city: 'Paris', venue: 'Parc des Princes' },
    ];

    const analyzeMatch = async (match) => {
        setSelectedMatch(match);
        setIsAnalyzing(true);
        setProgress(0);
        setAnalysisResults(null);

        // Simulate progressive analysis with multiple agents
        const steps = [
            'Desplegando Stats Scout...',
            'Analizando noticias recientes...',
            'Evaluando sentimiento social...',
            'Comparando cuotas en vivo...',
            'Verificando condiciones climáticas...',
            'Analizando jugadores clave...',
            'Calculando probabilidades H2H...',
            'Evaluando forma reciente...',
            'Verificando lesiones...',
            'Sintetizando predicción final...'
        ];

        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 400));
            setProgress(((i + 1) / steps.length) * 100);
        }

        // Generate analysis results
        setAnalysisResults(generateAnalysisResults(match));
        setIsAnalyzing(false);
    };

    return (
        <div className="min-h-screen bg-grid">
            <div className="bg-glow"></div>
            <Header />

            <main className="relative z-10 pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <section className="py-8 text-center">
                        <div className="inline-flex items-center gap-2 badge-diamond mb-4">
                            <span className="text-xl">🐝</span>
                            <span>Sistema de Colmena IA</span>
                        </div>
                        <h1 className="heading-xl mb-4">
                            Análisis <span className="text-gradient">Ultra-Profundo</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            10 agentes de IA especializados analizan simultáneamente
                            cada aspecto del partido
                        </p>
                    </section>

                    {/* Match Selection */}
                    {!selectedMatch && (
                        <section className="mb-8">
                            <h2 className="text-lg font-bold text-white mb-4">Selecciona un partido para analizar:</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sampleMatches.map((match) => (
                                    <button
                                        key={match.id}
                                        onClick={() => analyzeMatch(match)}
                                        className="glass-card p-6 text-left hover:border-cyan-500/50 transition-all group"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm text-gray-400">{match.league}</span>
                                            <span className="text-sm text-cyan-400">{match.time}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold text-white group-hover:text-gradient">
                                                {match.homeTeam}
                                            </span>
                                            <span className="text-gray-500">vs</span>
                                            <span className="text-xl font-bold text-white group-hover:text-gradient">
                                                {match.awayTeam}
                                            </span>
                                        </div>
                                        <div className="mt-3 text-xs text-gray-500">
                                            📍 {match.venue}, {match.city}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Analysis Progress */}
                    {isAnalyzing && (
                        <section className="mb-8">
                            <div className="glass-card p-8 text-center">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
                                    <span className="text-4xl">🐝</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    Colmena IA Analizando...
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    {selectedMatch?.homeTeam} vs {selectedMatch?.awayTeam}
                                </p>

                                <div className="max-w-md mx-auto">
                                    <div className="probability-bar h-3 mb-2">
                                        <div
                                            className="probability-fill transition-all duration-300"
                                            style={{
                                                width: `${progress}%`,
                                                background: 'linear-gradient(90deg, #00ff88, #00d4ff)'
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>Agentes activos: {Math.floor(progress / 10)}/10</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Analysis Results */}
                    {analysisResults && !isAnalyzing && (
                        <>
                            {/* Match Header */}
                            <section className="mb-6">
                                <div className="glass-card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <button
                                            onClick={() => {
                                                setSelectedMatch(null);
                                                setAnalysisResults(null);
                                            }}
                                            className="text-gray-400 hover:text-white flex items-center gap-2"
                                        >
                                            ← Volver
                                        </button>
                                        <span className="text-sm text-gray-400">{selectedMatch.league}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-center">
                                        <div className="flex-1">
                                            <div className="text-3xl mb-2">⚽</div>
                                            <h3 className="text-2xl font-bold text-white">{selectedMatch.homeTeam}</h3>
                                            <p className="text-gray-400">Local</p>
                                        </div>
                                        <div className="px-6">
                                            <div className="text-4xl font-bold text-gradient">{selectedMatch.time}</div>
                                            <div className="text-sm text-gray-500">{selectedMatch.venue}</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-3xl mb-2">⚽</div>
                                            <h3 className="text-2xl font-bold text-white">{selectedMatch.awayTeam}</h3>
                                            <p className="text-gray-400">Visitante</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* AI Summary */}
                            <AIAnalysisSummary />

                            {/* Tabs */}
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                                {[
                                    { id: 'overview', label: '📊 Resumen', icon: '' },
                                    { id: 'players', label: '👤 Jugadores', icon: '' },
                                    { id: 'odds', label: '💰 Cuotas', icon: '' },
                                    { id: 'factors', label: '🔍 Factores', icon: '' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${activeTab === tab.id
                                            ? 'bg-gradient-to-r from-green-500 to-cyan-500 text-black font-bold'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Main Prediction */}
                                    <div className="glass-card p-6">
                                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                            <span>🎯</span> Predicción Principal
                                        </h3>

                                        <div className="text-center mb-6">
                                            <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${analysisResults.prediction.confidence === 'diamond'
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                                : analysisResults.prediction.confidence === 'gold'
                                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black'
                                                    : 'bg-gradient-to-r from-gray-400 to-gray-500 text-black'
                                                }`}>
                                                {analysisResults.prediction.confidence === 'diamond' ? '💎' :
                                                    analysisResults.prediction.confidence === 'gold' ? '🥇' : '🥈'}
                                                {' '}
                                                {analysisResults.prediction.text}
                                            </span>
                                        </div>

                                        {/* Probability Bars */}
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-400">{selectedMatch.homeTeam}</span>
                                                    <span className="text-white font-bold">{analysisResults.prediction.probabilities.home}%</span>
                                                </div>
                                                <div className="probability-bar">
                                                    <div
                                                        className="probability-fill"
                                                        style={{
                                                            width: `${analysisResults.prediction.probabilities.home}%`,
                                                            background: 'linear-gradient(90deg, #00ff88, #00d4ff)'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-400">Empate</span>
                                                    <span className="text-white font-bold">{analysisResults.prediction.probabilities.draw}%</span>
                                                </div>
                                                <div className="probability-bar">
                                                    <div
                                                        className="probability-fill"
                                                        style={{
                                                            width: `${analysisResults.prediction.probabilities.draw}%`,
                                                            background: '#6b7280'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-400">{selectedMatch.awayTeam}</span>
                                                    <span className="text-white font-bold">{analysisResults.prediction.probabilities.away}%</span>
                                                </div>
                                                <div className="probability-bar">
                                                    <div
                                                        className="probability-fill"
                                                        style={{
                                                            width: `${analysisResults.prediction.probabilities.away}%`,
                                                            background: 'linear-gradient(90deg, #ff6b35, #ff0080)'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stake Recommendation */}
                                        <div className="mt-6 p-4 bg-black/30 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400">Stake sugerido:</span>
                                                <span className="text-green-400 font-bold">{analysisResults.prediction.stake}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-gray-400">Nivel de riesgo:</span>
                                                <span className={`font-bold ${analysisResults.prediction.risk === 'low' ? 'text-green-400' :
                                                    analysisResults.prediction.risk === 'medium' ? 'text-yellow-400' :
                                                        'text-red-400'
                                                    }`}>
                                                    {analysisResults.prediction.risk === 'low' ? 'Bajo' :
                                                        analysisResults.prediction.risk === 'medium' ? 'Medio' : 'Alto'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Key Insights */}
                                    <div className="glass-card p-6">
                                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                            <span>💡</span> Insights Clave
                                        </h3>
                                        <div className="space-y-3">
                                            {analysisResults.insights.map((insight, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`p-4 rounded-xl ${insight.type === 'positive' ? 'bg-green-500/10 border border-green-500/30' :
                                                        insight.type === 'negative' ? 'bg-red-500/10 border border-red-500/30' :
                                                            'bg-gray-500/10 border border-gray-500/30'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-lg">
                                                            {insight.type === 'positive' ? '✅' :
                                                                insight.type === 'negative' ? '⚠️' : 'ℹ️'}
                                                        </span>
                                                        <div>
                                                            <p className="text-white font-medium">{insight.title}</p>
                                                            <p className="text-sm text-gray-400 mt-1">{insight.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Weather */}
                                    <WeatherWidget city={selectedMatch.city} venue={selectedMatch.venue} />

                                    {/* Additional Markets */}
                                    <div className="glass-card p-6">
                                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                            <span>📈</span> Mercados Adicionales
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {analysisResults.additionalMarkets.map((market, idx) => (
                                                <div key={idx} className="p-3 bg-black/30 rounded-xl text-center">
                                                    <div className="text-sm text-gray-400 mb-1">{market.name}</div>
                                                    <div className="text-lg font-bold text-white">{market.prediction}</div>
                                                    <div className={`text-xs mt-1 ${market.confidence === 'high' ? 'text-green-400' :
                                                        market.confidence === 'medium' ? 'text-yellow-400' :
                                                            'text-gray-500'
                                                        }`}>
                                                        {market.confidence === 'high' ? '⭐⭐⭐' :
                                                            market.confidence === 'medium' ? '⭐⭐' : '⭐'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'players' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-bold text-white mb-4">{selectedMatch.homeTeam} - Jugadores Clave</h3>
                                        {analysisResults.homePlayers.map((player, idx) => (
                                            <div key={idx} className="mb-4">
                                                <PlayerAnalysisCard player={player} />
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white mb-4">{selectedMatch.awayTeam} - Jugadores Clave</h3>
                                        {analysisResults.awayPlayers.map((player, idx) => (
                                            <div key={idx} className="mb-4">
                                                <PlayerAnalysisCard player={player} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'odds' && (
                                <OddsComparison
                                    matchId={selectedMatch.id}
                                    homeTeam={selectedMatch.homeTeam}
                                    awayTeam={selectedMatch.awayTeam}
                                />
                            )}

                            {activeTab === 'factors' && (
                                <div className="glass-card p-6">
                                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                        <span>🔍</span> Factores Analizados ({analysisResults.factors.length})
                                    </h3>
                                    <div className="space-y-4">
                                        {analysisResults.factors.map((factor, idx) => (
                                            <div key={idx} className="p-4 bg-black/30 rounded-xl">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-white">{factor.name}</span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${factor.impact.includes('local') || factor.impact.includes('Local')
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : factor.impact.includes('visitante') || factor.impact.includes('Visitante')
                                                            ? 'bg-red-500/20 text-red-400'
                                                            : 'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {factor.impact}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-400">{factor.detail}</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">Peso:</span>
                                                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-green-400 to-cyan-400"
                                                            style={{ width: `${Math.min(parseFloat(factor.weight) * 10, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-cyan-400">{factor.weight}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                </div>
            </main>
        </div>
    );
}

// Generate comprehensive analysis results
function generateAnalysisResults(match) {
    const homeAdvantage = Math.random() > 0.4;
    const homeProb = homeAdvantage ? 45 + Math.floor(Math.random() * 25) : 25 + Math.floor(Math.random() * 20);
    const awayProb = homeAdvantage ? 20 + Math.floor(Math.random() * 20) : 35 + Math.floor(Math.random() * 25);
    const drawProb = 100 - homeProb - awayProb;

    const maxProb = Math.max(homeProb, awayProb, drawProb);
    let predictionText, confidence;

    if (homeProb === maxProb) {
        predictionText = `Victoria ${match.homeTeam}`;
    } else if (awayProb === maxProb) {
        predictionText = `Victoria ${match.awayTeam}`;
    } else {
        predictionText = 'Empate';
    }

    if (maxProb >= 65) {
        confidence = 'diamond';
    } else if (maxProb >= 50) {
        confidence = 'gold';
    } else {
        confidence = 'silver';
    }

    return {
        prediction: {
            text: predictionText,
            confidence,
            probabilities: { home: homeProb, draw: drawProb, away: awayProb },
            stake: confidence === 'diamond' ? '4 unidades' : confidence === 'gold' ? '2 unidades' : '1 unidad',
            risk: maxProb >= 60 ? 'low' : maxProb >= 45 ? 'medium' : 'high'
        },
        insights: [
            {
                type: 'positive',
                title: `${match.homeTeam} en excelente forma`,
                description: 'Racha de 4 victorias consecutivas en casa'
            },
            {
                type: 'negative',
                title: 'Baja importante confirmada',
                description: 'Jugador clave del mediocampo no jugará por sanción'
            },
            {
                type: 'neutral',
                title: 'Historial equilibrado',
                description: 'Últimos 5 enfrentamientos: 2 victorias cada uno, 1 empate'
            },
        ],
        factors: [
            { name: 'Estadísticas xG', impact: homeAdvantage ? 'Favorece local' : 'Favorece visitante', weight: (5 + Math.random() * 5).toFixed(1), detail: `xG promedio: ${match.homeTeam} 1.8, ${match.awayTeam} 1.4` },
            { name: 'Forma reciente', impact: homeAdvantage ? 'Favorece local' : 'Equilibrado', weight: (4 + Math.random() * 4).toFixed(1), detail: 'Análisis de los últimos 10 partidos' },
            { name: 'Historial H2H', impact: 'Equilibrado', weight: (3 + Math.random() * 3).toFixed(1), detail: '8 victorias, 4 empates, 6 derrotas' },
            { name: 'Estado físico', impact: 'Favorece local', weight: (4 + Math.random() * 3).toFixed(1), detail: 'Menos días de descanso para el visitante' },
            { name: 'Lesiones', impact: 'Favorece visitante', weight: (3 + Math.random() * 4).toFixed(1), detail: '2 titulares del local ausentes' },
            { name: 'Sentimiento social', impact: homeAdvantage ? 'Favorece local' : 'Neutral', weight: (2 + Math.random() * 2).toFixed(1), detail: '75% de menciones positivas para el local' },
            { name: 'Ventaja de local', impact: 'Favorece local', weight: '5.0', detail: 'Factor estadístico de jugar en casa' },
        ],
        additionalMarkets: [
            { name: 'Over/Under 2.5', prediction: Math.random() > 0.5 ? 'Over 2.5' : 'Under 2.5', confidence: 'high' },
            { name: 'Ambos Anotan', prediction: Math.random() > 0.5 ? 'Sí' : 'No', confidence: 'medium' },
            { name: 'Córners', prediction: 'Over 9.5', confidence: 'medium' },
            { name: 'Tarjetas', prediction: 'Over 3.5', confidence: 'low' },
        ],
        homePlayers: ['Bellingham', 'Vinícius Jr'],
        awayPlayers: ['Lewandowski', 'Pedri'],
    };
}
