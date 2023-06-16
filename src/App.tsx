import React, { useEffect, useRef } from 'react';

function App() {
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    const AudioContext = window.AudioContext;
    audioContext.current = new AudioContext();
  }, [])

  const playSound = () => {
    if (audioContext.current === null) {
      return;
    }

    const oscillator = new OscillatorNode(audioContext.current, {
      frequency: 440,
      type: "sine"
    })

    oscillator.connect(audioContext.current.destination);
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

      <main className='h-full flex flex-col align-middle justify-center'>
        <div className='flex justify-center'>
          <button className='btn btn-primary' onClick={() => playSound()}>Play Sound!</button>
        </div>
      </main>
    </div>
  );
}

export default App;
