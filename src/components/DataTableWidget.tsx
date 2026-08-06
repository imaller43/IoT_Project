import React from 'react';
import { SensorData } from '../types';

interface DataTableWidgetProps {
  title: string;
  data: SensorData[];
  valueLabel: string;
  colorHighlight?: string;
}

const DataTableWidget: React.FC<DataTableWidgetProps> = ({ 
  title, 
  data, 
  valueLabel,
  colorHighlight = '#3b82f6'
}) => {
  return (
    <div className="panel">
      <div className="panel-header">
        <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: colorHighlight}}></div>
        {title}
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{width: '60%', backgroundColor: 'var(--table-header-bg)'}}>Time</th>
              <th style={{
                width: '40%', 
                background: `linear-gradient(0deg, ${colorHighlight}33, ${colorHighlight}33), var(--table-header-bg)`, 
                color: colorHighlight
              }}>{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {[...data].reverse().map((row, idx) => (
              <tr key={idx}>
                <td>{row.time}</td>
                <td style={{backgroundColor: `${colorHighlight}11`, color: 'var(--text-primary)', fontWeight: 600}}>{row.value.toFixed(2)}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={2} style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>
                  Waiting for data...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTableWidget;
