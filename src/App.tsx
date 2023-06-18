import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  EnvelopeParams,
  createADSRNode,
  createOscillator,
  OscillatorTypes,
} from './Oscillator';

interface MIDIMessageEvent extends Event {
  data: Uint8Array;
}

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

  const midiInputs = useRef<Set<WebMidi.MIDIInput>>(new Set());
  const [activeNotes, setActiveNotes] = useState<Map<number, { oscillator: OscillatorNode, adsrGainNode: GainNode }>>(new Map());

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

  const startEnvelope = useCallback((noteNumber: number) => {
    if (audioContext.current === null) {
      return;
    }

    const newOscillator = createOscillator(audioContext.current, oscillatorType, noteNumber);
    const newAdsrGainNode = createADSRNode(audioContext.current, envelopeParams);
    const globalVolume = audioContext.current.createGain();
    globalVolume.gain.value = volume / 100; // Set the global volume

    globalVolume.connect(audioContext.current.destination);
    newAdsrGainNode.connect(globalVolume);
    newOscillator.connect(newAdsrGainNode);
    newOscillator.start();

    setActiveNotes(prevNotes => {
      const newNotes = new Map(prevNotes);
      newNotes.set(noteNumber, { oscillator: newOscillator, adsrGainNode: newAdsrGainNode });
      console.log(newNotes)
      return newNotes;
    });
  }, [audioContext, oscillatorType, envelopeParams, volume]);

  // Function to end the envelope
  const endEnvelope = useCallback((noteNumber: number) => {

    setActiveNotes(prevNotes => {
      if (!audioContext.current) {
        return prevNotes
      }

      const newNotes = new Map(prevNotes);
      const note = newNotes.get(noteNumber);

      if (note) {
        note.adsrGainNode.gain.setValueAtTime(note.adsrGainNode.gain.value, audioContext.current.currentTime); // Set the current gain immediately
        note.adsrGainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.current.currentTime + envelopeParams.release); // Exponential release phase

        // Optionally, stop and disconnect the oscillator after the release phase is done
        setTimeout(() => {
          note.oscillator.stop();
          note.oscillator.disconnect();
          note.adsrGainNode.disconnect();
        }, envelopeParams.release * 1000); // setTimeout uses milliseconds

        newNotes.delete(noteNumber);
      }

      return newNotes;
    });
  }, [audioContext, envelopeParams.release]);

  useEffect(() => {
    const AudioContext = window.AudioContext;
    audioContext.current = new AudioContext();

  }, []);

  // Function to handle incoming MIDI messages
  const handleMIDIMessage = useCallback((event: Event) => {
    const message = event as MIDIMessageEvent;
    const [status, note, velocity] = message.data;

    // MIDI "note on" message
    if (status === 144) {
      startEnvelope(note);
    }

    // MIDI "note off" message
    else if (status === 128) {
      endEnvelope(note);
    }
  }, [startEnvelope, endEnvelope]);

  // Function to initialize the MIDI API
  const initializeMIDI = useCallback(async () => {
    if (!navigator.requestMIDIAccess) {
      console.log("WebMIDI is not supported in this browser.");
      return;
    }

    const midiAccess: WebMidi.MIDIAccess = await navigator.requestMIDIAccess();

    midiInputs.current.forEach((input) => {
      input.onmidimessage = () => { };
    });

    // Listen for MIDI messages on all inputs
    for (let input of midiAccess.inputs.values()) {
      input.onmidimessage = handleMIDIMessage;

      // Only add the input to the state if it's not already there

      const prevInputs = midiInputs.current
      if (!prevInputs.has(input)) {
        const newMidiInputs = new Set(prevInputs);
        newMidiInputs.add(input);
        midiInputs.current = newMidiInputs
      }

    }
  }, [handleMIDIMessage])


  // Call the initializeMIDI function when the component mounts
  useEffect(() => {
    console.log('doing midi')
    initializeMIDI();
    return () => {
      midiInputs.current.forEach((input) => {
        input.onmidimessage = () => { };
      });
    };
  }, [initializeMIDI]);

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
          <button
            className={`btn ${activeNotes.size > 0 ? 'btn-disabled' : 'btn-primary'}`}
            onClick={() => startEnvelope(60)}  // Assuming you want to play note 60 when the button is clicked
          >
            Play Sound!
          </button>
          <button
            className='btn btn-primary'
            onClick={() => { activeNotes.forEach((_, note) => endEnvelope(note)); }} // Ends all currently playing notes
          >
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
