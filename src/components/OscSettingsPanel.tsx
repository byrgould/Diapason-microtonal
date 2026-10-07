import React, { useState, useEffect } from 'react';
import { oscService } from '../core/osc/OscService';

interface OscSettingsPanelProps {
  currentTuning: string;
}

export const OscSettingsPanel: React.FC<OscSettingsPanelProps> = ({ currentTuning }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(oscService.getConfig());
  const [status, setStatus] = useState({ linked: false, log: '' });

  // Update config when global tuning changes
  useEffect(() => {
    let anchorDegree = 0;
    let baseRootFloat = 60.0;
    
    if (currentTuning === '12-TET') {
      anchorDegree = 60;
      baseRootFloat = 60.0;
    } else if (currentTuning === "D'Alessandro") {
      anchorDegree = 0;
      baseRootFloat = 168.0;
    } else if (currentTuning === "Harry Partch's 11-limit JI") {
      anchorDegree = 43; // G4 is degree 43 (G3 is degree 0). This maps G4 to BaseRootFloat 172.0
      baseRootFloat = 172.0;
    }
    
    oscService.setConfig({ anchorDegree, baseRootFloat });
    setConfig(oscService.getConfig());
  }, [currentTuning]);

  useEffect(() => {
    const unsubscribe = oscService.subscribe(setStatus);
    return unsubscribe;
  }, []);

  const handleChange = (key: keyof typeof config, value: any) => {
    oscService.setConfig({ [key]: value });
    setConfig(oscService.getConfig());
  };

  return (
    <div className={`string-settings-panel ${isOpen ? 'open' : 'closed'}`} style={{ backgroundColor: '#475569' }}>
      <div className="panel-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>Configuración OSC</h3>
        <button>{isOpen ? '▲' : '▼'}</button>
      </div>
      
      {isOpen && (
        <div className="panel-content" style={{ padding: '15px', color: '#f8fafc', fontSize: '0.85rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                id="osc-led-link" 
                style={{ width: '12px', height: '12px', borderRadius: '50%', background: status.linked ? '#2b8a3e' : '#ff9b9b', boxShadow: '0 0 5px rgba(0,0,0,0.5)' }} 
                title={status.linked ? 'Bridge Conectado' : 'Bridge Desconectado'}
              />
              <span style={{ fontWeight: 'bold' }}>Link</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                id="osc-led-send" 
                style={{ width: '12px', height: '12px', borderRadius: '50%', background: config.enabled ? '#2b8a3e' : '#ff9b9b', boxShadow: '0 0 5px rgba(0,0,0,0.5)' }} 
                title={config.enabled ? 'OSC Activado' : 'OSC Desactivado'}
              />
              <span style={{ fontWeight: 'bold' }}>Send</span>
            </div>
          </div>

          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Enable OSC</label>
            <input 
              type="checkbox" 
              checked={config.enabled} 
              onChange={(e) => handleChange('enabled', e.target.checked)} 
              style={{ transform: 'scale(1.2)' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Target IP</label>
            <input 
              type="text" 
              value={config.ip} 
              onChange={(e) => handleChange('ip', e.target.value)} 
              style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #64748b', background: '#1e293b', color: 'white' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Target UDP Port</label>
            <input 
              type="number" 
              value={config.port} 
              onChange={(e) => handleChange('port', parseInt(e.target.value) || 0)} 
              style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #64748b', background: '#1e293b', color: 'white' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Base Root Float</label>
            <input 
              type="number" 
              step="0.01"
              value={config.baseRootFloat} 
              onChange={(e) => handleChange('baseRootFloat', parseFloat(e.target.value) || 0)} 
              style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #64748b', background: '#1e293b', color: 'white' }}
            />
            <small style={{ color: '#94a3b8', display: 'block', marginTop: '4px' }}>Anclado a {currentTuning}</small>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button 
              onClick={() => oscService.allNotesOff()}
              style={{ flex: 1, padding: '6px', background: '#b91c1c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              All Notes Off
            </button>
            <button 
              onClick={() => oscService.allSoundOff()}
              style={{ flex: 1, padding: '6px', background: '#991b1b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              All Sound Off
            </button>
          </div>

          <div 
            id="osc-monitor" 
            style={{ 
              marginTop: '15px', 
              background: '#0f172a', 
              padding: '8px', 
              borderRadius: '4px', 
              fontFamily: 'monospace', 
              fontSize: '0.75rem', 
              color: '#10b981',
              height: '50px',
              overflow: 'hidden',
              whiteSpace: 'pre-wrap'
            }}
            dangerouslySetInnerHTML={{ __html: status.log || 'Esperando mensajes...' }}
          />
        </div>      )}
    </div>
  );
};
