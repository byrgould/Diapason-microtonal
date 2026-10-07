import { OSCMessage } from './OSCMessage';

export interface OscConfig {
  ip: string;
  port: number;
  baseRootFloat: number;
  enabled: boolean;
  anchorDegree: number;
}

class OscService {
  private socket: WebSocket | null = null;
  private config: OscConfig = {
    ip: '127.0.0.1',
    port: 57120,
    baseRootFloat: 60.0,
    enabled: false,
    anchorDegree: 60
  };
  private linked = false;
  private onStatusChangeCallbacks: ((status: { linked: boolean, log: string }) => void)[] = [];
  private log: string[] = [];

  constructor() {
    this.initWebSocket();
  }

  private initWebSocket() {
    if (this.socket) {
      this.socket.close();
    }
    
    // We connect to the Node.js bridge server
    const wsUrl = `ws://${window.location.hostname || "localhost"}:8082`;
    this.socket = new WebSocket(wsUrl);
    this.socket.binaryType = "arraybuffer";

    this.socket.onopen = () => {
      this.linked = true;
      this.addLog("Vínculo Bridge Establecido (WS)");
    };

    this.socket.onclose = () => {
      this.linked = false;
      this.addLog("Vínculo Bridge Perdido. Reintentando...");
      setTimeout(() => this.initWebSocket(), 5000);
    };

    this.socket.onerror = () => {
      this.linked = false;
    };
  }

  private addLog(msg: string) {
    this.log.push(msg);
    if (this.log.length > 3) this.log.shift();
    this.notifyListeners();
  }

  private notifyListeners() {
    const status = { linked: this.linked, log: this.log.join('\n') };
    this.onStatusChangeCallbacks.forEach(cb => cb(status));
  }

  public subscribe(cb: (status: { linked: boolean, log: string }) => void) {
    this.onStatusChangeCallbacks.push(cb);
    cb({ linked: this.linked, log: this.log.join('\n') });
    return () => {
      this.onStatusChangeCallbacks = this.onStatusChangeCallbacks.filter(x => x !== cb);
    };
  }

  public setConfig(updates: Partial<OscConfig>) {
    this.config = { ...this.config, ...updates };
  }

  public getConfig() {
    return this.config;
  }

  public dispatchOSC(address: string, types: string, args: (number | string)[]) {
    const forcedTypes = types.replace(/i/g, "f");
    const visualArgs = args.map(a => typeof a === "number" ? a.toFixed(2) : a).join(", ");
    this.addLog(`[${address}, ${visualArgs}]`);

    if (this.config.enabled && this.linked && this.socket && this.socket.readyState === WebSocket.OPEN) {
      const msg = new OSCMessage(address, forcedTypes, args as number[]);
      const packet = msg.encode();
      
      this.socket.send(JSON.stringify({
        type: "osc",
        ip: this.config.ip,
        port: this.config.port,
        message: Array.from(new Uint8Array(packet))
      }));
    }
  }

  // Helper for Fretlets to trigger Notes
  public triggerNote(absoluteDegree: number, isOn: boolean) {
    if (!this.config.enabled) return;
    
    // float_value = internal_degree - anchorDegree + BaseRootFloat
    const oscFloat = absoluteDegree - this.config.anchorDegree + this.config.baseRootFloat;
    
    this.dispatchOSC('/mnote', 'ff', [oscFloat, isOn ? 127.0 : 0.0]);
  }
  
  public allNotesOff() {
    this.dispatchOSC('/allnotesoff', '', []);
  }

  public allSoundOff() {
    this.dispatchOSC('/allsoundoff', '', []);
  }
}

export const oscService = new OscService();
