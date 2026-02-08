# Informe de Auditoría Técnica: Oráculo Quantum V40.0 🌌🧠

Este documento detalla la arquitectura, lógica y funcionamiento del sistema de predicción más avanzado de OmniBet. El Oráculo V40.0 ha trascendido el análisis estadístico simple para convertirse en un **ecosistema cognitivo** que entiende el fútbol como un sistema complejo.

---

## 🏗️ Arquitectura de Capas Cognitivas

El Oráculo procesa cada partido a través de 5 capas de inferencia antes de emitir un veredicto:

### 1. Capa de Estabilidad (Graph Engine)
- **Lógica**: Modela al equipo como un grafo de interdependencia.
- **Función**: Identifica "Hubs" (jugadores centrales como capitanes o creadores de juego).
- **Cálculo**: Si un Hub falta, el sistema aplica una penalización no lineal a la estabilidad táctica, detectando una posible fragmentación del sistema que las estadísticas individuales ignoran.
- **Archivo**: `src/lib/graph-engine.js`

### 2. Capa Táctica (ADN Intelligence)
- **Lógica**: Clasificación por clustering de estilos de juego.
- **Función**: Asigna un ADN (ej: *Presión Alta*, *Contraataque Vertical*) basado en patrones de resultados y métricas de líderes.
- **Cero-Sum Matchup**: Calcula la ventaja estratégica comparando los ADNs. Un estilo de *Presión Alta* recibe un bono contra un equipo de *Posesión Lenta*.
- **Archivo**: `src/lib/tactical-adn.js`

### 3. Capa Psicológica (Bayesian HMM)
- **Lógica**: Modelo Oculto de Márkov (Inferencia de Estado Latente).
- **Función**: Determina si el equipo está en un estado de racha *IMPARABLE*, *STABLE* o *CRISIS*.
- **Confianza**: Asigna un nivel de confianza a la probabilidad de estar en ese estado, afectando el multiplicador de probabilidad final.
- **Archivo**: `src/lib/pattern-scout.js`

### 4. Capa de Consenso (Market Wisdom)
- **Lógica**: Arbitraje de probabilidades implícitas.
- **Función**: Lee las cuotas reales del mercado y las normaliza (sin overround).
- **Value Detect**: Si la probabilidad de la IA es >5% superior a la del mercado, se activa el distintivo **ELITE VALUE**.
- **Archivo**: `src/lib/real-data-service.js`

### 5. Capa de Gestión de Capital (Risk Engine)
- **Lógica**: Criterio de Kelly Fractario (1/4).
- **Función**: No solo predice, sino que recomienda cuánto dinero arriesgar.
- **Matemática**: f = (bp - q) / b. Asegura que el usuario maximice el crecimiento de su banca sin arriesgar la ruina por varianza.
- **Archivo**: `src/lib/risk-engine.js`

---

## 🔢 El Proceso de Predicción V40.0

1.  **Ingesta**: Recopila datos de ESPN (Resultados, Lesiones, Líderes, Cuotas).
2.  **Meta-Modelo**: Ajusta los pesos base (Elo, Oracle, Poisson, Market) según el tipo de partido (Gigantes vs Equilibrados).
3.  **Inferencia Cuántica**:
    -   Se aplica el **Multiplicador de ADN** (Choque táctico).
    -   Se aplica el **Factor de Estabilidad del Grafo** (Química del equipo).
4.  **Calibración Brier**: Compara la probabilidad final con victorias pasadas similares para asegurar que el sistema no esté "sobreconfiado".
5.  **Veredicto**: Genera la probabilidad final, explicación XAI y sugerencia de stake Kelly.

---

## ⚖️ Sinceridad y Precisión

El Oráculo utiliza el **Brier Score** para su autogestión:
- **BS < 0.25**: Calibración Excelente (La IA es honesta con las probabilidades).
- **BS > 0.40**: Necesidad de Recalibración (La IA está siendo demasiado optimista o pesimista).

---

## 🏁 Conclusión del Auditor
El Oráculo Quantum V40.0 es un sistema de **IA Explicable (XAI)** que prioriza la gestión de riesgos y la comprensión táctica profunda sobre el acierto aleatorio. Es, en esencia, un **analista profesional y un gestor de fondos cuantitativo** integrados en una sola plataforma.
