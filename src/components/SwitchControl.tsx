import React from 'react';
import { useMqtt } from '../context/MqttContext';

const SwitchControl: React.FC = () => {
  const { publishSwitch, switchStates } = useMqtt();

  const handleToggle = (topic: string, currentVal: boolean) => {
    const newVal = !currentVal;
    // We only publish. The state will update automatically when the MQTT broker sends the message back.
    publishSwitch(topic, newVal);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        GPIO Control Switches
      </div>
      <div className="switch-grid">
        <div className="switch-container">
          <span className="switch-label">FAN</span>
          <label className="toggle">
            <input
              type="checkbox"
              checked={switchStates.fan}
              onChange={() => handleToggle('sapura/bilik1/switch/fan', switchStates.fan)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="switch-container">
          <span className="switch-label">INTERRUPT</span>
          <label className={`toggle ${switchStates.interruptHardware || switchStates.interruptTempOverride ? 'disabled' : ''}`}>
            <input
              type="checkbox"
              checked={switchStates.interruptHardware || switchStates.interruptTempOverride || switchStates.interruptSoftware}
              disabled={switchStates.interruptHardware || switchStates.interruptTempOverride}
              onChange={() => handleToggle('sapura/bilik1/switch/interrupt', switchStates.interruptSoftware)}
            />
            <span className="slider"></span>
          </label>
          {(switchStates.interruptHardware || switchStates.interruptTempOverride) && (
            <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600, textAlign: 'center' }}>
              {switchStates.interruptTempOverride ? 'Override Activated : High Temperature' : 'Override Activated'}
            </div>
          )}
        </div>
        <div className="switch-container">
          <span className="switch-label">LIGHT</span>
          <label className="toggle">
            <input
              type="checkbox"
              checked={switchStates.light}
              onChange={() => handleToggle('sapura/bilik1/switch/light', switchStates.light)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SwitchControl;

