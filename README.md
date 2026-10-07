# Diapasón Microtonal Virtual (8 Cuerdas)

Un diapasón interactivo para guitarra clásica de 8 cuerdas basado en el modelo de Tolgahan Çoğulu, construido con React, Vite y TypeScript. Permite la visualización y construcción de sistemas microtonales (como 12-TET y D'Alessandro) con compensación física de *True Temperament* en tiempo real.

## Requisitos Previos

Para ejecutar este proyecto en tu computadora, necesitas tener instalado **Node.js** (que incluye `npm`). Puedes descargarlo desde [nodejs.org](https://nodejs.org/).

## Cómo ejecutar el proyecto

Las instrucciones son idénticas para **Mac**, **Linux** y **Windows** (usando la terminal, línea de comandos o PowerShell):

1. **Abre tu terminal** (Terminal en Mac/Linux, o Símbolo del Sistema / PowerShell en Windows).
2. **Navega a la carpeta del proyecto**:
   ```bash
   cd /Users/byron/Documents/microtonalGuitar
   # (En Windows la ruta será diferente, por ejemplo: cd C:\Ruta\Al\Proyecto\microtonalGuitar)
   ```
3. **Instala las dependencias** (solo es necesario la primera vez):
   ```bash
   npm install
   ```
4. **Inicia el servidor local de desarrollo**:
   ```bash
   npm run dev
   ```
5. **Abre el programa en tu navegador**:
   Una vez que el servidor esté corriendo, abre tu navegador web preferido (Chrome, Firefox, Safari, Edge) y ve a la siguiente dirección:
   👉 **http://localhost:5175**

---

## Conexión OSC (Open Sound Control)

El diapasón puede enviar datos OSC a cualquier software de audio (SuperCollider, Max, Pure Data, etc.) de manera fluida y en tiempo real. 

### Arquitectura (El Bridge)
Dado que los navegadores web bloquean el envío de paquetes UDP (el protocolo nativo de OSC), utilizamos una pequeña arquitectura "puente":
1. El navegador genera el paquete OSC binario nativo y lo envía mediante **WebSocket**.
2. Un pequeño servidor en Node.js recibe el buffer binario y lo despacha inmediatamente por **UDP**.

### Cómo iniciar el envío OSC

1. Abre una **nueva** pestaña en tu terminal y navega a la carpeta del proyecto.
2. Levanta el servidor puente ejecutando:
   ```bash
   npm run bridge
   ```
3. El puente iniciará y se quedará escuchando conexiones locales (en el puerto `8082`).
4. Ve al navegador donde tienes corriendo la interfaz gráfica.
5. Abre el menú desplegable **Configuración OSC**, marca la casilla **Enable OSC** y configúralo con la IP y el Puerto de tu programa destino (ej. 57120 para SuperCollider).
6. ¡Toca la guitarra! Verás en la consola en pantalla los paquetes despachados.

### Convivencia con `hexgrid-workspace`

Este servidor puente está diseñado para funcionar en el puerto `8082`, mientras que el proyecto `hexgrid-workspace` funciona en el puerto `8081`. 

**¡No hay ningún conflicto!**
Puedes tener abiertos y funcionando simultáneamente:
- El puente de `hexgrid-workspace` (`npm run bridge` en su carpeta).
- El puente de `microtonalGuitar` (`npm run bridge` en esta carpeta).
- Las interfaces de ambos proyectos en tu navegador o en tus dispositivos móviles (iPad, iPhone).

Ambos sistemas pueden enviar datos a la misma IP y Puerto UDP destino de manera simultánea. Es decir, puedes tocar un acorde en el teclado hexagonal y un glissando en la guitarra de manera concurrente controlando el mismo sintetizador, o enrutar cada controlador a diferentes sintetizadores, tanto en SuperCollider como en Max o Pure Data.
