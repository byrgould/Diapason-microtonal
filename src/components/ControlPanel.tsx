import React from 'react';

interface ControlPanelProps {
  children?: React.ReactNode;
  currentModelId: string;
  currentTuningName: string;
  visualGuide: 'JI' | 'Harmonics';
  onSelectVisualGuide: (guide: 'JI' | 'Harmonics') => void;
  clickMode: 'play' | 'ghost' | 'chord';
  onSelectClickMode: (mode: 'play' | 'ghost' | 'chord') => void;
  showTTDemo: boolean;
  onSelectInstrument: (modelId: string) => void;
  onSelectTuning: (tuningName: 'ET12' | 'DAlessandro' | 'HarryPartch') => void;
  onNewFretboard: () => void;
  onToggleFlip: () => void;
  onToggleTTDemo: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  currentModelId,
  currentTuningName, 
  visualGuide,
  showTTDemo,
  onSelectVisualGuide,
  clickMode,
  onSelectClickMode,
  onSelectInstrument,
  onSelectTuning, 
  onNewFretboard,
  onToggleFlip,
  onToggleTTDemo,
  children
}) => {
  let selectValue = 'ET12';
  if (currentTuningName === "D'Alessandro") selectValue = 'DAlessandro';
  else if (currentTuningName === "Harry Partch's 11-limit JI") selectValue = 'HarryPartch';

  return (
    <div className="control-panel">
      <div className="instrument-selector" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Instrumento:</label>
          <select 
            value={currentModelId} 
            onChange={(e) => onSelectInstrument(e.target.value)}
            style={{ padding: '0.5rem', background: '#334155', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            <option value="pyramid-8-classical">Guitarra Clásica (8 cuerdas)</option>
            <option value="viola-4-4">Viola 4/4 (16")</option>
            <option value="violin-4-4">Violín 4/4</option>
            <option value="cello-4-4">Violonchelo (Cello) 4/4</option>
            <option value="contrabajo-3-4">Contrabajo 3/4 (Orquesta)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Afinación:</label>
          <select 
            value={selectValue} 
            onChange={(e) => onSelectTuning(e.target.value as any)}
            style={{ padding: '0.5rem', background: '#334155', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            <option value="ET12">Temperamento Igual (12-TET)</option>
            <option value="DAlessandro">Erv Wilson's D'Alessandro</option>
            <option value="HarryPartch">Harry Partch's 11-limit JI</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Guías visuales:</label>
          <select 
            value={visualGuide} 
            onChange={(e) => onSelectVisualGuide(e.target.value as 'JI' | 'Harmonics')}
            style={{ padding: '0.5rem', background: '#334155', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            <option value="JI">Guías Justa Entonación</option>
            <option value="Harmonics">Armónicos Naturales</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Modo clic:</label>
          <select 
            value={clickMode} 
            onChange={(e) => onSelectClickMode(e.target.value as 'play' | 'ghost' | 'chord')}
            style={{ 
              padding: '0.5rem', 
              background: clickMode === 'play' ? '#3b82f6' : clickMode === 'ghost' ? '#8b5cf6' : '#eab308', 
              color: clickMode === 'chord' ? 'black' : 'white', 
              border: 'none', 
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            <option value="play">Tocar 🎵</option>
            <option value="chord">Armar Acorde 🎹</option>
            <option value="ghost">Ocultar 👻</option>
          </select>
        </div>

        <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
          {currentModelId !== 'viola-4-4' && currentModelId !== 'violin-4-4' && currentModelId !== 'cello-4-4' && currentModelId !== 'contrabajo-3-4' && (
            <button 
              onClick={onToggleTTDemo} 
              style={{ backgroundColor: showTTDemo ? '#ef4444' : '#334155', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              {showTTDemo ? 'Ocultar Trastes TT' : 'Ver Trastes TT'}
            </button>
          )}
          <button onClick={onToggleFlip} style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', backgroundColor: '#1e293b', color: 'white', cursor: 'pointer' }}>
            Voltear 180°
          </button>
          <button className="primary" onClick={onNewFretboard} style={{ display: 'none' }}>
            + Crear nuevo diapasón
          </button>
        </div>
      </div>
      <div style={{ position: 'relative', marginLeft: 'auto', alignSelf: 'flex-end', width: 0, height: 0 }}>
        {children}
      </div>
    </div>
  );
};
