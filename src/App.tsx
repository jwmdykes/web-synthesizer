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

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const [adsrGainNode, setAdsrGainNode] = useState<GainNode | null>(null);

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

  const startEnvelope = () => {
    if (audioContext.current === null) {
      return;
    }

    const newOscillator = createOscillator(audioContext.current, oscillatorType);
    const newAdsrGainNode = createADSRNode(audioContext.current, envelopeParams);
    const globalVolume = audioContext.current.createGain();
    globalVolume.gain.value = volume / 100; // Set the global volume

    globalVolume.connect(audioContext.current.destination);
    newAdsrGainNode.connect(globalVolume);
    newOscillator.connect(newAdsrGainNode);
    newOscillator.start();

    setOscillator(newOscillator);
    setAdsrGainNode(newAdsrGainNode);
    setIsPlaying(true);
  };

  // Function to end the envelope
  const endEnvelope = () => {
    if (!adsrGainNode || !audioContext.current || adsrGainNode.gain.value <= 0) {
      return;
    }

    adsrGainNode.gain.setValueAtTime(adsrGainNode.gain.value, audioContext.current.currentTime); // Set the current gain immediately
    adsrGainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.current.currentTime + envelopeParams.release); // Exponential release phase
    setIsPlaying(false);

    // Optionally, stop and disconnect the oscillator after the release phase is done
    setTimeout(() => {
      oscillator?.stop();
      oscillator?.disconnect();
      adsrGainNode.disconnect();
    }, envelopeParams.release * 1000); // setTimeout uses milliseconds
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
        <div className='flex flex-row gap-3 justify-center'>
          <button className={`btn ${isPlaying ? 'btn-disabled' : 'btn-primary'}`} onClick={startEnvelope}>
            Play Sound!
          </button>
          <button className='btn btn-primary' onClick={endEnvelope}>
            Stop Sound!
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
          <h2 className='text-xl'>Gain: {volume}</h2>
          <input
            type='range'
            min={0}
            max='100'
            value={volume}
            className='range'
            onChange={handleVolumeChange}
          />
          <h2 className='text-xl'>Amplitude Envelope</h2>
          <h3>Attack: {envelopeParams.attack}</h3>
          <input
            type='range'
            min={0.01}
            max='1'
            step='0.01'
            value={envelopeParams.attack}
            className='range'
            onChange={handleAttackChange}
          />
          <h3>Decay: {envelopeParams.decay}</h3>
          <input
            type='range'
            min={0}
            max='1'
            step='0.01'
            value={envelopeParams.decay}
            className='range'
            onChange={handleDecayChange}
          />
          <h3>Sustain: {envelopeParams.sustain}</h3>
          <input
            type='range'
            min={0.01}
            max='1'
            step='0.01'
            value={envelopeParams.sustain}
            className='range'
            onChange={handleSustainChange}
          />
          <h3>Release: {envelopeParams.release}</h3>
          <input
            type='range'
            min={0.01}
            max='3'
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
