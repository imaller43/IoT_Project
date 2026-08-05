import React, { useState } from 'react';
import { useMqtt } from '../context/MqttContext';

const SwitchControl: React.FC = () => {
  const { publishSwitch } = useMqtt();
  const [switchFan, setSwitchFan] = useState(false);
  const [switchInterrupt, setSwitchInterrupt] = useState(false);
  const [switchLight, setSwitchLight] = useState(false);

  const handleToggle = (topic: string, currentVal: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    const newVal = !currentVal;
    setter(newVal);
    publishSwitch(topic, newVal);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        GPIO Control Switches
      </div>
      <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <div className="switch-container">
          <span className="switch-label">FAN</span>
          <label className="toggle">
            <input
              type="checkbox"
              checked={switchFan}
              onChange={() => handleToggle('sapura/bilik1/switch/fan', switchFan, setSwitchFan)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="switch-container">
          <span className="switch-label">INTERRUPT</span>
          <label className="toggle">
            <input
              type="checkbox"
              checked={switchInterrupt}
              onChange={() => handleToggle('sapura/bilik1/switch/interrupt', switchInterrupt, setSwitchInterrupt)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="switch-container">
          <span className="switch-label">LIGHT</span>
          <label className="toggle">
            <input
              type="checkbox"
              checked={switchLight}
              onChange={() => handleToggle('sapura/bilik1/switch/light', switchLight, setSwitchLight)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SwitchControl;

