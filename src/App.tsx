import React, { useEffect, useRef, useState } from 'react';

type EnvelopeParams = {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

function App() {
  const audioContext = useRef<AudioContext | null>(null);
  const [volume, setVolume] = useState(50);
  const [envelopeParams, setEnvelopeParams] = useState<EnvelopeParams>({
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.3,
  })

  useEffect(() => {
    const AudioContext = window.AudioContext;
    audioContext.current = new AudioContext();
  }, [])

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(event.target.value));
  }

  const handleAttackChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnvelopeParams(prevState => ({ ...prevState, attack: Number(event.target.value) }));
  };

  const handleDecayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnvelopeParams(prevState => ({ ...prevState, decay: Number(event.target.value) }));
  };

  const handleSustainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnvelopeParams(prevState => ({ ...prevState, sustain: Number(event.target.value) }));
  };

  const handleReleaseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnvelopeParams(prevState => ({ ...prevState, release: Number(event.target.value) }));
  };

  const createADSRNode = (audioContext: AudioContext, { attack, decay, sustain, release }: EnvelopeParams, startAt = audioContext.currentTime) => {
    const gainNode = audioContext.createGain();

    const maxGain = 1;
    const sustainGain = maxGain * sustain;

    gainNode.gain.setValueAtTime(0, startAt);
    gainNode.gain.linearRampToValueAtTime(maxGain, startAt + attack);
    gainNode.gain.linearRampToValueAtTime(sustainGain, startAt + attack + decay);
    gainNode.gain.setTargetAtTime(0, startAt + attack + decay + sustain, release);

    return gainNode;
  }

  const playSound = () => {
    if (audioContext.current === null) {
      return;
    }

    const oscillator = new OscillatorNode(audioContext.current, {
      frequency: 440,
      type: "sine"
    })

    const envelope = createADSRNode(audioContext.current, envelopeParams);

    const globalVolume = audioContext.current.createGain();
    globalVolume.gain.value = volume / 100; // Set the global volume

    oscillator.connect(envelope);
    envelope.connect(globalVolume);
    globalVolume.connect(audioContext.current.destination);

    oscillator.start()
    // oscillator.stop(audioContext.current.currentTime + 0.5);
  }

  return (
    <div className="App h-full">
      <nav className="navbar bg-base-100">
        <div className="navbar-start">
          <a href="/" className='btn btn-ghost normal-case text-xl'>Synthesizer</a>
        </div>
      </nav>

      <main className='flex flex-col gap-5'>
        <div className='m-auto'>
          <button className='btn btn-primary' onClick={playSound}>Play Sound!</button>
        </div>
        <div className='m-auto'>
          <h2 className='text-xl'>Gain</h2>
          <input type="range" min={0} max="100" value={volume} className="range" onChange={handleVolumeChange} />
          <h2 className='text-xl'>Amplitude Envelope</h2>
          <h3>Attack</h3>
          <input type="range" min={0} max="1" step="0.01" value={envelopeParams.attack} className="range" onChange={handleAttackChange} />
          <h3>Decay</h3>
          <input type="range" min={0} max="1" step="0.01" value={envelopeParams.decay} className="range" onChange={handleDecayChange} />
          <h3>Sustain</h3>
          <input type="range" min={0} max="1" step="0.01" value={envelopeParams.sustain} className="range" onChange={handleSustainChange} />
          <h3>Release</h3>
          <input type="range" min={0} max="1" step="0.01" value={envelopeParams.release} className="range" onChange={handleReleaseChange} />
        </div>
      </main>
    </div>
  );
}

export default App;
