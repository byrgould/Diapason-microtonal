/**
 * BRIDGE OSC (WebSocket to UDP)
 * 
 * Translates JSON packets containing binary buffers from the browser (via WebSocket)
 * into raw UDP packets to send to SuperCollider, Max, Pd, etc.
 */
import { WebSocketServer } from 'ws';
import dgram from 'dgram';
import os from 'os';

const WS_PORT = 8082;

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const LOCAL_IP = getLocalIP();

// --- UDP Client for sending packets ---
const udpClient = dgram.createSocket('udp4');

udpClient.on('error', (err) => {
    console.error(`[UDP SERVER ERROR]:\n${err.stack}`);
    udpClient.close();
});

// --- WebSocket Server ---
const wss = new WebSocketServer({ port: WS_PORT }, () => {
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
                const buffer = Buffer.from(msg.message);
                
                // Send raw binary buffer via UDP
                udpClient.send(buffer, 0, buffer.length, msg.port, msg.ip, (err) => {
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
