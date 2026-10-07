# Propuesta Arquitectónica: Diapasón Virtual Microtonal

## Goal Description
Construir una aplicación web interactiva que emule el "8 string classical fretboard" de Tolgahan Çoğulu. La aplicación actuará como un controlador OSC para enviar frecuencias (Hz) o notas MIDI microtonales a sintetizadores como SuperCollider, Max/MSP o Ableton.

La arquitectura debe soportar afinaciones microtonales avanzadas (EDO, Justa Entonación, D'Alessandro, Partch, etc.), permitiendo que el usuario asigne un *subset* de escalas (como MOS o CPS) para no atiborrar el diapasón de ranuras/trastes, y calibrando la posición visual y el cálculo de afinación según el grosor, la tensión y la longitud vibratoria de las cuerdas (True Temperament/Dynamic Intonation).

## Enfoque Arquitectónico (React + Vite)

El sistema se dividirá en 3 capas principales siguiendo la filosofía de *Clean Architecture* y el patrón *Container-Presentational*:

### 1. Fretboard Math Engine (Core / Lógica de Negocio)
Este módulo será puramente matemático y sin dependencias de UI. Se encargará de:
- **Cálculo de Ratios:** Funciones puras extraídas de `Sintetizador microtonal 16.txt` (ej: derivación de raíces logarítmicas como `2.pow(1/53)` para 53-EDO, o ratios enteros para JI).
- **Subsets (Filtros):** Capacidad de filtrar un sistema complejo (ej: 53-EDO) usando patrones de Momento de Simetría (MOS) o elegir grados específicos (CPS de D'Alessandro).
- **Física de Cuerdas (Dynamic Intonation):** Recibir la Longitud Vibratoria (650mm), la frecuencia base (Hz) de afinación de la cuerda, y opcionalmente un perfil de tensión (plain vs wound) para ajustar matemáticamente la desviación ("sharping") en el mástil.

### 2. Capa Presentacional (UI Interactiva del Diapasón)
Renderizado usando HTML5 Canvas o SVG (vía componentes React) para garantizar precisión visual milimétrica.
- **Renderizado Independiente:** Cada cuerda (de las 8) será un componente autónomo con su propio *array* de trastes, cejuela a la derecha y boca a la izquierda.
- **Interacciones:** Eventos de click/touch sobre los trastes o zonas *fretless* que emitirán objetos de estado con la frecuencia exacta seleccionada.

### 3. OSC Bridge (Transporte)
Capa encargada de recibir la frecuencia (Hz) emitida por la UI y mandarla vía OSC (Open Sound Control) al backend/localhost donde esté corriendo SuperCollider. (Nota: los navegadores web no pueden mandar UDP/OSC directamente, por lo que usaremos una pequeña pasarela Node.js/WebSockets o `osc.js`).

## Proposed Changes

> [!NOTE]
> Todos los cambios se realizarán dentro del marco de Vite + React.

### Core Architecture

#### [NEW] `src/core/math/tunings.ts`
Fórmulas de EDO (12, 31, 41, 53) y Justa Entonación (Partch, Centaur, D'Alessandro). Implementación de la lógica extraída del SC.

#### [NEW] `src/core/math/physics.ts`
Motor de compensación por tensión y grosor. Recibirá el "Tuning Array" puro y aplicará el *offset* dinámico basado en la escala de 650mm de las cuerdas Pyramid.

#### [NEW] `src/core/models/FretboardState.ts`
Manejo del estado de la guitarra: 8 cuerdas, afinación de cada una al aire (Hz base), y qué "subset" de notas (MOS/CPS) está activado por cuerda.

### UI Components

#### [NEW] `src/components/GuitarNeck.tsx`
Componente contenedor principal. Maneja la orientación (cejuela derecha, boca izquierda).

#### [NEW] `src/components/String.tsx`
Renderiza la línea visual de la cuerda (calibre dependiente del índice 1 a 8).

#### [NEW] `src/components/Fretlet.tsx`
Cada traste individual y dinámico calculado milimétricamente en el eje X.

### Transport

#### [NEW] `src/services/OSCService.ts`
Servicio de comunicación (WebSocket hacia Node.js o directo si usamos un bridge) para mandar rutas tipo `/mnote` con los Hertz correspondientes.
