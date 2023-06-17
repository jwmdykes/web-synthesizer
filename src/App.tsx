import React, { useEffect, useRef, useState } from 'react';
import {
  EnvelopeParams,
  createADSRNode,
  createOscillator,
  OscillatorTypes,
} from './Oscillator';

function App() {
  const audioContext = useRef<AudioContext | null>(null);
  const [volume, setVolume] = useState(50);
  const [envelopeParams, setEnvelopeParams] = useState<EnvelopeParams>({
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.3,
  });
  const [oscillatorType, setOscillatorType] = useState<OscillatorTypes>('sine');

  useEffect(() => {
    const AudioContext = window.AudioContext;
    audioContext.current = new AudioContext();
  }, []);

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(event.target.value));
  };

  const handleAttackChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnvelopeParams((prevState) => ({
      ...prevState,
      attack: Number(event.target.value),
    }));
  };

  const handleDecayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnvelopeParams((prevState) => ({
      ...prevState,
      decay: Number(event.target.value),
    }));
  };

  const handleSustainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnvelopeParams((prevState) => ({
      ...prevState,
      sustain: Number(event.target.value),
    }));
  };

  const handleReleaseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnvelopeParams((prevState) => ({
      ...prevState,
      release: Number(event.target.value),
    }));
  };

  const handleOscillatorTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setOscillatorType(event.target.value as OscillatorTypes);
  };

  const playSound = () => {
    if (audioContext.current === null) {
      return;
    }

    const oscillator = createOscillator(audioContext.current, oscillatorType);
    const envelope = createADSRNode(audioContext.current, envelopeParams);

    const globalVolume = audioContext.current.createGain();
    globalVolume.gain.value = volume / 100; // Set the global volume

    oscillator.connect(envelope);
    envelope.connect(globalVolume);
    globalVolume.connect(audioContext.current.destination);

    oscillator.start();
    // oscillator.stop(audioContext.current.currentTime + 0.5);
  };

  return (
    <div className='App h-full'>
      <nav className='navbar bg-base-100'>
        <div className='navbar-start'>
          <a href='/' className='btn btn-ghost normal-case text-xl'>
            Synthesizer
          </a>
        </div>
      </nav>

      <main className='flex flex-col gap-5'>
        <div className='m-auto'>
          <button className='btn btn-primary' onClick={playSound}>
            Play Sound!
          </button>
        </div>
        <div className='m-auto flex flex-col gap-2'>
          <h2 className='text-xl'>Oscillator Type</h2>
          <select
            className='select w-full max-w-xs'
            value={oscillatorType}
            onChange={handleOscillatorTypeChange}
          >
            <option value='sine'>sine</option>
            <option value='square'>square</option>
            <option value='triangle'>triangle</option>
          </select>
          <h2 className='text-xl'>Gain</h2>
          <input
            type='range'
            min={0}
            max='100'
            value={volume}
            className='range'
            onChange={handleVolumeChange}
          />
          <h2 className='text-xl'>Amplitude Envelope</h2>
          <h3>Attack</h3>
          <input
            type='range'
            min={0}
            max='1'
            step='0.01'
            value={envelopeParams.attack}
            className='range'
            onChange={handleAttackChange}
          />
          <h3>Decay</h3>
          <input
            type='range'
            min={0}
            max='1'
            step='0.01'
            value={envelopeParams.decay}
            className='range'
            onChange={handleDecayChange}
          />
          <h3>Sustain</h3>
          <input
            type='range'
            min={0}
            max='1'
            step='0.01'
            value={envelopeParams.sustain}
            className='range'
            onChange={handleSustainChange}
          />
          <h3>Release</h3>
          <input
            type='range'
            min={0}
            max='1'
            step='0.01'
            value={envelopeParams.release}
            className='range'
            onChange={handleReleaseChange}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
