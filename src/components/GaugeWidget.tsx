import React from 'react';
import GaugeComponentModule from 'react-gauge-component';

// Vite ESM/CommonJS interop workaround for this specific library
const GaugeComponent = (GaugeComponentModule as any).default || GaugeComponentModule;

interface GaugeWidgetProps {
  title: string;
  value: number;
  minValue?: number;
  maxValue?: number;
  unit?: string;
  colors?: string[];
  colorThreshold?: number;
}

// Helper to interpolate two hex colors
const interpolateColor = (color1: string, color2: string, factor: number) => {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const GaugeWidget: React.FC<GaugeWidgetProps> = ({ 
  title, 
  value, 
  minValue = 0, 
  maxValue = 100,
  unit = '',
  colors = ['#3b82f6', '#ffffff'],
  colorThreshold
}) => {
  // Create multiple small subArcs with manually interpolated colors to form a true gradient
  const subArcs = Array.from({ length: 30 }, (_, i) => {
    const arcValue = minValue + (i / 29) * (maxValue - minValue);
    let factor = i / 29;
    
    if (colorThreshold !== undefined) {
      factor = (arcValue - minValue) / (colorThreshold - minValue);
      if (factor > 1) factor = 1;
      if (factor < 0) factor = 0;
    }
    
    return {
      color: interpolateColor(colors[0], colors[1], factor)
    };
  });

  return (
    <div className="panel">
      <div className="panel-header">
        <div style={{width: 8, height: 8, borderRadius: '50%', background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`}}></div>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '1rem 0' }}>
        <GaugeComponent
          type="semicircle"
          arc={{
            width: 0.2,
            padding: 0.0,
            cornerRadius: 0,
            subArcs: subArcs
          }}
          pointer={{
            type: "needle",
            elastic: true,
            animationDelay: 0,
            color: '#adb5bd'
          }}
          value={value}
          minValue={minValue}
          maxValue={maxValue}
          labels={{
            valueLabel: { hide: true },
            tickLabels: {
              type: 'outer',
              defaultTickValueConfig: { formatTextValue: (v: any) => v.toString(), style: {fontSize: 10, fill: '#adb5bd'} },
              ticks: [
                { value: minValue },
                { value: minValue + (maxValue-minValue)*0.2 },
                { value: minValue + (maxValue-minValue)*0.8 },
                { value: maxValue }
              ],
            }
          }}
          style={{ width: '100%', maxWidth: '280px' }}
        />
        <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '-20px' }}>
          {value.toFixed(2)} {unit}
        </div>
      </div>
    </div>
  );
};

export default GaugeWidget;

