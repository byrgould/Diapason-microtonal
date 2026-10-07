import React, { useState } from 'react';
import type { FretboardState, GuitarString } from '../core/models/FretboardState';
import { DALESSANDRO_PRESETS, PARTCH_PRESETS, generateRelativeFrets } from '../core/math/CPSLibrary';

interface FretConstructorPanelProps {
  fretboardState: FretboardState;
  onUpdateStringProps: (stringId: number, updates: Partial<GuitarString>) => void;
}

export const FretConstructorPanel: React.FC<FretConstructorPanelProps> = ({ fretboardState, onUpdateStringProps }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStringId, setSelectedStringId] = useState<number>(fretboardState.strings[0].id);

  const activeString = fretboardState.strings.find(s => s.id === selectedStringId);
  const isDAlessandro = activeString?.tuningSystem.name.includes("D'Alessandro");
  const isPartch = activeString?.tuningSystem.name.includes("Partch");

  const scaleSize = isDAlessandro ? 42 : (isPartch ? 43 : 12);
  const presets = isDAlessandro ? DALESSANDRO_PRESETS : (isPartch ? PARTCH_PRESETS : []);

  const isSubsetActive = (presetId: string) => {
    if (!activeString || !activeString.activePresetIds) return false;
    return activeString.activePresetIds.includes(presetId);
  };

  const handleApplyPreset = (presetId: string) => {
    if (!activeString) return;
    
    let newActivePresetIds = activeString.activePresetIds ? [...activeString.activePresetIds] : [];
    
    if (isSubsetActive(presetId)) {
      // Toggle Off
      newActivePresetIds = newActivePresetIds.filter(id => id !== presetId);
    } else {
      // Toggle On
      newActivePresetIds.push(presetId);
    }
    
    if (newActivePresetIds.length === 0) {
      onUpdateStringProps(activeString.id, { totalFrets: 0, activeFrets: undefined, activePresetIds: [] });
    } else {
      // Recalculate ALL frets based on all active presets
      let allActiveFrets = new Set<number>();
      for (const id of newActivePresetIds) {
        const preset = presets.find(p => p.id === id);
        if (preset) {
          const frets = generateRelativeFrets(preset.degrees, activeString.startingDegree || 0, scaleSize, 100);
          frets.forEach(f => allActiveFrets.add(f));
        }
      }
      
      const newActiveFrets = Array.from(allActiveFrets).sort((a, b) => a - b);
      onUpdateStringProps(activeString.id, { 
        totalFrets: 100, 
        activeFrets: newActiveFrets,
        activePresetIds: newActivePresetIds
      });
    }
  };

  const handleClearFrets = () => {
    if (!activeString) return;
    onUpdateStringProps(activeString.id, { 
      totalFrets: 0, 
      activeFrets: undefined,
      ghostFrets: [],
      activePresetIds: []
    });
  };

  const handleFillAllFrets = () => {
    if (!activeString) return;
    onUpdateStringProps(activeString.id, { 
      totalFrets: 100, 
      activeFrets: undefined, // Undefined means draw all up to totalFrets
      activePresetIds: []
    });
  };

  return (
    <div className={`string-settings-panel ${isOpen ? 'open' : 'closed'}`} style={{ marginTop: '10px' }}>
      <div className="panel-header" onClick={() => setIsOpen(!isOpen)} style={{ backgroundColor: '#2563eb' }}>
        <h3>Constructor Interactivo de {fretboardState.modelId === 'viola-4-4' || fretboardState.modelId === 'violin-4-4' || fretboardState.modelId === 'cello-4-4' || fretboardState.modelId === 'contrabajo-3-4' ? 'digitaciones' : 'Trastes'}</h3>
        <button>{isOpen ? '▲' : '▼'}</button>
      </div>
      
      {isOpen && (
        <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>Seleccionar Cuerda:</label>
            <select 
              value={selectedStringId} 
              onChange={(e) => setSelectedStringId(Number(e.target.value))}
              style={{ padding: '5px', borderRadius: '4px', background: '#1e293b', color: 'white', border: '1px solid #334155' }}
            >
              {fretboardState.strings.map(s => (
                <option key={s.id} value={s.id}>Cuerda {s.id} ({activeString?.tuningSystem.getNoteName?.(s.startingDegree || 0) || s.baseFreq.toFixed(1) + 'Hz'})</option>
              ))}
            </select>
          </div>

          {(isDAlessandro || isPartch) ? (
            <>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  onClick={handleClearFrets}
                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Lienzo en Blanco (Limpiar)
                </button>
                <button 
                  onClick={handleFillAllFrets}
                  style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Llenar Todos los Trastes
                </button>
              </div>

              <div>
                <h4 style={{ marginBottom: '10px', color: '#cbd5e1' }}>Subconjuntos / Bibliotecas</h4>
                <div style={{ maxHeight: '45vh', overflowY: 'auto', paddingRight: '5px' }}>
                  {Object.entries(
                    presets.reduce((acc, preset) => {
                      const g = preset.group || 'Otros';
                      if (!acc[g]) acc[g] = [];
                      acc[g].push(preset);
                      return acc;
                    }, {} as Record<string, typeof presets>)
                  ).map(([groupName, groupPresets]) => (
                    <details key={groupName} style={{ marginBottom: '10px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                      <summary style={{ padding: '8px 12px', cursor: 'pointer', background: '#334155', fontWeight: 'bold', userSelect: 'none' }}>
                        {groupName} ({groupPresets.length})
                      </summary>
                      <div style={{ padding: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                        {groupPresets.map(preset => (
                          <button 
                            key={preset.id}
                            onClick={() => handleApplyPreset(preset.id)}
                            style={{ 
                              background: isSubsetActive(preset.id) ? '#22c55e' : '#334155', 
                              color: 'white', 
                              border: isSubsetActive(preset.id) ? '1px solid #16a34a' : '1px solid #475569', 
                              padding: '8px', 
                              borderRadius: '4px', 
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.2s',
                              fontSize: '0.85rem'
                            }}
                            title={`Grados: ${preset.degrees.join(', ')}`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p style={{ color: '#94a3b8' }}>El constructor interactivo está disponible para sistemas microtonales (D'Alessandro o Partch).</p>
          )}

        </div>
      )}
    </div>
  );
};
