/**
 * BRIDGE OSC (WebSocket to UDP)
 * 
 * Translates JSON packets containing binary buffers from the browser (via WebSocket)
 * into raw UDP packets to send to SuperCollider, Max, Pd, etc.
 * 
 * Security hardened:
 * - Origin validation on WebSocket handshake
 * - IP destination restriction (loopback / local subnet)
 * - Port range enforcement
 * - Binary buffer length constraints
 */
import { WebSocketServer } from 'ws';
import dgram from 'dgram';
import os from 'os';

const WS_PORT = parseInt(process.env.WS_PORT || '8082', 10);
const ALLOWED_UDP_PORTS_MIN = 1024;
const ALLOWED_UDP_PORTS_MAX = 65535;
const MAX_PACKET_BYTES = 4096;

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

const LOCAL_IP = getLocalIP();
const ALLOWED_IPS = new Set([
    '127.0.0.1',
    'localhost',
    '::1',
    LOCAL_IP
]);

if (process.env.ALLOWED_OSC_IPS) {
    process.env.ALLOWED_OSC_IPS.split(',').forEach(ip => ALLOWED_IPS.add(ip.trim()));
}

function isOriginAllowed(origin) {
    if (!origin) return true; // Direct non-browser clients
    try {
        const url = new URL(origin);
        return (
            url.hostname === 'localhost' ||
            url.hostname === '127.0.0.1' ||
            url.hostname === LOCAL_IP
        );
    } catch {
        return false;
    }
}

// --- UDP Client for sending packets ---
const udpClient = dgram.createSocket('udp4');

udpClient.on('error', (err) => {
    console.error(`[UDP SERVER ERROR]:\n${err.stack}`);
});

// --- WebSocket Server ---
const wss = new WebSocketServer({ 
    port: WS_PORT,
    verifyClient: (info, callback) => {
        const origin = info.origin || info.req.headers.origin;
        if (isOriginAllowed(origin)) {
            callback(true);
        } else {
            console.warn(`[BRIDGE] Connection rejected from unauthorized origin: ${origin}`);
            callback(false, 403, 'Forbidden origin');
        }
    }
}, () => {
    console.log('=========================================');
    console.log('   MICROTONAL GUITAR - OSC BRIDGE v1.0   ');
    console.log('=========================================');
    console.log(`[WS] Listening on ws://${LOCAL_IP}:${WS_PORT}`);
    console.log('-----------------------------------------');
});

wss.on('connection', (ws) => {
    console.log('[BRIDGE] Fretboard linked.');

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data.toString());
            
            if (msg.type === 'osc') {
                const targetIp = typeof msg.ip === 'string' ? msg.ip.trim() : '127.0.0.1';
                const targetPort = parseInt(msg.port, 10);

                if (!ALLOWED_IPS.has(targetIp)) {
                    console.warn(`[BRIDGE BLOCKED] Destination IP not allowed: ${targetIp}`);
                    return;
                }

                if (isNaN(targetPort) || targetPort < ALLOWED_UDP_PORTS_MIN || targetPort > ALLOWED_UDP_PORTS_MAX) {
                    console.warn(`[BRIDGE BLOCKED] Destination port outside range: ${targetPort}`);
                    return;
                }

                if (!Array.isArray(msg.message) || msg.message.length > MAX_PACKET_BYTES) {
                    console.warn('[BRIDGE BLOCKED] Message buffer missing or exceeds max payload');
                    return;
                }

                const buffer = Buffer.from(msg.message);
                
                // Send validated binary buffer via UDP
                udpClient.send(buffer, 0, buffer.length, targetPort, targetIp, (err) => {
                    if (err) {
                        console.error('[UDP ERROR]', err);
                    }
                });
            }
        } catch (e) {
            console.error('[PROCESS ERROR]', e.message);
        }
    });

    ws.on('close', () => {
        console.log('[BRIDGE] Fretboard disconnected.');
    });
});
