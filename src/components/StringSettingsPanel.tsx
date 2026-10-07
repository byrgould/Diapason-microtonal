import React, { useState } from 'react';
import type { FretboardState, GuitarString } from '../core/models/FretboardState';
import { GUITAR_MODELS } from '../core/models/GuitarModels';

interface StringSettingsPanelProps {
  fretboardState: FretboardState;
  onUpdateStringProps: (stringId: number, updates: Partial<GuitarString>) => void;
}

export const StringSettingsPanel: React.FC<StringSettingsPanelProps> = ({ fretboardState, onUpdateStringProps }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`string-settings-panel ${isOpen ? 'open' : 'closed'}`}>
      <div className="panel-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>Configuración de Cuerdas</h3>
        <button>{isOpen ? '▲' : '▼'}</button>
      </div>
      
      {isOpen && (
        <div className="panel-content">
          <p className="panel-info">
            Escala Global: {fretboardState.scaleLength} mm | {GUITAR_MODELS[fretboardState.modelId]?.name}
          </p>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ON</th>
                  <th>Cuerda</th>
                  <th>Calibre (mm)</th>
                  <th>Tensión (kg)</th>
                  <th>Material</th>
                    {fretboardState.strings[0].tuningSystem.name === "Harry Partch's 11-limit JI" && <th>Grado Partch</th>}
                </tr>
              </thead>
              <tbody>
                {fretboardState.strings.map(s => (
                  <tr key={s.id} className={s.enabled ? '' : 'disabled-row'}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={s.enabled} 
                        onChange={(e) => onUpdateStringProps(s.id, { enabled: e.target.checked })}
                      />
                    </td>
                    <td style={{ fontWeight: 'bold', color: s.enabled ? 'white' : '#64748b' }}>Cuerda {s.id}</td>
                    <td>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={s.gauge} 
                        disabled={!s.enabled}
                        onChange={(e) => onUpdateStringProps(s.id, { gauge: parseFloat(e.target.value) || 0 })}
                        style={{ width: '70px' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={s.tension} 
                        disabled={!s.enabled}
                        onChange={(e) => onUpdateStringProps(s.id, { tension: parseFloat(e.target.value) || 0 })}
                        style={{ width: '70px' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={s.material} 
                        disabled={!s.enabled}
                        onChange={(e) => onUpdateStringProps(s.id, { material: e.target.value })}
                        style={{ width: '250px' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
