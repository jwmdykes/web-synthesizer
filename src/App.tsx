import React, { useEffect, useRef, useState } from 'react';

function App() {
  const audioContext = useRef<AudioContext | null>(null);
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    const AudioContext = window.AudioContext;
    audioContext.current = new AudioContext();
  }, [])

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(event.target.value));
  }

  const playSound = () => {
    if (audioContext.current === null) {
      return;
    }

    const oscillator = new OscillatorNode(audioContext.current, {
      frequency: 440,
      type: "sine"
    })

    const gainNode = audioContext.current.createGain();
    gainNode.gain.value = volume / 100;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.start()
    oscillator.stop(audioContext.current.currentTime + 0.5);
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
        </div>
      </main>
    </div>
  );
}

export default App;
