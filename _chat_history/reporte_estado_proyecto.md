# Omnibet AI: Reporte de Estado del Proyecto

## Descripción General
**Omnibet AI** es una plataforma de análisis y predicción deportiva de nivel profesional. Utiliza datos en tiempo real de la API de ESPN para proporcionar marcadores, análisis detallados de partidos y sugerencias impulsadas por IA para ayudar a los usuarios en la toma de decisiones (con fines educativos).

## Arquitectura y Stack Tecnológico
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Estilo**: Vanilla CSS (Global y por Componente) para una estética premium y personalizada.
- **Fuente de Datos**: [API de ESPN](https://site.api.espn.com/) (Endpoints REST).
- **Integración de IA**: Motor de razonamiento personalizado para predicciones (preparado para integración con LLMs).
- **Backend / DB**: [Supabase](https://supabase.com/) (Configurado para auth, logs y datos de usuario).

## Funcionalidades Principales Implementadas

### 1. Marcador en Vivo
- Actualizaciones en tiempo real para múltiples deportes (Fútbol, NBA, NFL, MLB, NHL, ATP).
- Mapeo dinámico de "slugs" de ligas para llamadas precisas a la API.

### 2. Análisis Detallado de Partidos
- **Cara a Cara (H2H)**: Visualización histórica de encuentros pasados.
- **Estado de Forma Reciente**: Guía de rendimiento de los últimos 5 partidos.
- **Plantilla Universal (Roster)**: Sistema de búsqueda multi-estrategia que funciona incluso para partidos de copa y diferentes niveles de liga.
- **Lesiones y Oficiales**: Reporte en tiempo real de disponibilidad de jugadores y árbitros del encuentro.

### 3. Predicciones con IA
- Motor de "Razonamiento" basado en reglas para analizar tendencias de equipos y sugerir apuestas.
- Historias profesionales de partidos y "puntos de ventaja" generados dinámicamente.

### 4. Paneles Especializados
- **Dashboard de Rendimiento**: Rastrea la tasa de éxito de las predicciones de la IA a lo largo del tiempo.
- **Panel de Administración**: Centro de control para ajustes de la app y depuración.
- **Historial**: Archivo de predicciones pasadas y sus resultados.

## Estado Actual y Mejoras Recientes

### Completado Recientemente
- **Búsqueda Inteligente de Plantillas**: Implementación de `fetchRosterUniversal` con tres estrategias (Liga del Partido, Liga Local y "Smart Guess") para asegurar que nunca falten los datos de los jugadores.
- **Respaldo de Forma (Form Fallback)**: Se solucionaron problemas en partidos de copa (como la Coupe de France) donde faltaba el historial, obteniendo automáticamente el calendario del equipo.
- **Universalización de Deportes**: Mapeo mejorado para endpoints de Béisbol (MLB), Fútbol Americano (NFL) y Hockey (NHL).

### En Proceso
- **Integración de Estadísticas de Jugadores**: Investigando y mapeando endpoints para "Puntos por Partido" (PPG) y otras métricas clave.
- **Mapeo de NBA**: Verificado el endpoint `byathlete` y la estructura de datos para estadísticas de la NBA.
- **Mapeo de Fútbol**: Probando estadísticas similares para ligas de fútbol europeas.

## Estructura de Archivos del Proyecto
```text
omnibet-ai/
├── src/
│   ├── app/                # Next.js App Router (Páginas y API)
│   ├── components/         # Componentes UI (Análisis, Dashboard, Modals)
│   ├── context/            # Gestión de Estado Global
│   └── lib/                # Lógica Central (Servicios API, Utilidades)
├── public/                 # Recursos estáticos
├── supabase/               # Configuraciones de base de datos
└── docs/                   # Documentación interna
```

## Próximos Pasos
1.  **Finalizar Mapeo de Estadísticas**: Actualizar `formatRoster` para incluir PPG y otras métricas.
2.  **Visualización en la UI**: Actualizar `DetailedMatchAnalysis.jsx` para mostrar las estadísticas en la tabla de la plantilla.
3.  **Validación Exhaustiva**: Pruebas completas en todos los deportes para asegurar la consistencia.
4.  **Refinamiento Estético**: Toques finales a la vista de "Análisis".

---
*Reporte generado el 3 de febrero de 2026.*
