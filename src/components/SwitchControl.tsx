import React, { useState } from 'react';
import { useMqtt } from '../context/MqttContext';

const SwitchControl: React.FC = () => {
  const { publishSwitch } = useMqtt();
  const [switch1, setSwitch1] = useState(false);
  const [switch2, setSwitch2] = useState(false);

  const handleToggle = (id: number, currentVal: boolean) => {
    const newVal = !currentVal;
    if (id === 1) {
      setSwitch1(newVal);
      publishSwitch(1, newVal);
    } else {
      setSwitch2(newVal);
      publishSwitch(2, newVal);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        GPIO Control Switches
      </div>
      <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="switch-container">
          <span className="switch-label">FAN</span>
          <label className="toggle">
            <input
              type="checkbox"
              checked={switch1}
              onChange={() => handleToggle(1, switch1)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="switch-container">
          <span className="switch-label">INTERRUPT</span>
          <label className="toggle">
            <input
              type="checkbox"
              checked={switch2}
              onChange={() => handleToggle(2, switch2)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SwitchControl;

