import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  MouseEventHandler,
} from 'react';

import Piano from './Piano';
import ControlBoxHeader from './ControlBoxHeader';

import {
  EnvelopeParams,
  createADSRNode,
  createOscillator,
  OscillatorTypes,
} from './Oscillator';

import { createFilterNode, filterParams, filterType } from './Filter';

import SingleKnobControl from './SingleKnobControl';
import ControlBox from './ControlBox';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';

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
  const [filterParams, setFilterParams] = useState<filterParams>({
    type: 'lowpass',
    frequency: 350,
    Q: 1,
  });
  const [oscillatorType, setOscillatorType] = useState<OscillatorTypes>('sine');

  const midiInputs = useRef<Set<WebMidi.MIDIInput>>(new Set());
  const [activeNotes, setActiveNotes] = useState<
    Map<number, { oscillator: OscillatorNode; adsrGainNode: GainNode }>
  >(new Map());

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(event.target.value));
  };

  const handleFilterFrequencyChange = (val: number) => {
    setFilterParams((prevState) => ({
      ...prevState,
      frequency: val,
    }));
  };

  const handleFilterQChange = (val: number) => {
    setFilterParams((prevState) => ({
      ...prevState,
      Q: val,
    }));
  };

  const handleFilterTypeChange = (val: filterType) => {
    setFilterParams((prevState) => ({
      ...prevState,
      type: val,
    }));
  };

  const handleAttackChange = (val: number) => {
    setEnvelopeParams((prevState) => ({
      ...prevState,
      attack: val,
    }));
  };

  const handleDecayChange = (val: number) => {
    setEnvelopeParams((prevState) => ({
      ...prevState,
      decay: Number(val),
    }));
  };

  const handleSustainChange = (val: number) => {
    setEnvelopeParams((prevState) => ({
      ...prevState,
      sustain: Number(val),
    }));
  };

  const handleReleaseChange = (val: number) => {
    setEnvelopeParams((prevState) => ({
      ...prevState,
      release: Number(val),
    }));
  };

  const handleOscillatorTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setOscillatorType(event.target.value as OscillatorTypes);
  };

  const startEnvelope = useCallback(
    (noteNumber: number, velocity: number) => {
      if (audioContext.current === null) {
        return;
      }

      const newOscillator = createOscillator(
        audioContext.current,
        oscillatorType,
        noteNumber
      );
      const newAdsrGainNode = createADSRNode(
        audioContext.current,
        envelopeParams
      );
      const newFilterNode = createFilterNode(
        audioContext.current,
        filterParams
      );
      const globalVolume = audioContext.current.createGain();

      const scaledVelocity = Math.pow(velocity, 1.5);
      // const scaledVelocity = Math.log(1 + velocity / 127);

      globalVolume.gain.value = (volume / 100) * scaledVelocity; // Set the global volume

      globalVolume.connect(audioContext.current.destination);
      newFilterNode.connect(globalVolume);
      newAdsrGainNode.connect(newFilterNode);
      newOscillator.connect(newAdsrGainNode);
      newOscillator.start();

      setActiveNotes((prevNotes) => {
        const newNotes = new Map(prevNotes);
        newNotes.set(noteNumber, {
          oscillator: newOscillator,
          adsrGainNode: newAdsrGainNode,
        });
        console.log(newNotes);
        return newNotes;
      });
    },
    [audioContext, oscillatorType, envelopeParams, volume, filterParams]
  );

  // Function to end the envelope
  const endEnvelope = useCallback(
    (noteNumber: number) => {
      setActiveNotes((prevNotes) => {
        if (!audioContext.current) {
          return prevNotes;
        }

        const newNotes = new Map(prevNotes);
        const note = newNotes.get(noteNumber);

        if (note) {
          note.adsrGainNode.gain.setValueAtTime(
            note.adsrGainNode.gain.value,
            audioContext.current.currentTime
          ); // Set the current gain immediately
          note.adsrGainNode.gain.exponentialRampToValueAtTime(
            0.00001,
            audioContext.current.currentTime + envelopeParams.release
          ); // Exponential release phase

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
    },
    [audioContext, envelopeParams.release]
  );

  useEffect(() => {
    const AudioContext = window.AudioContext;
    audioContext.current = new AudioContext();
  }, []);

  // Function to handle incoming MIDI messages
  const handleMIDIMessage = useCallback(
    (event: Event) => {
      const message = event as MIDIMessageEvent;
      const [status, note, velocity] = message.data;

      // MIDI "note on" message
      if (status === 144) {
        startEnvelope(note, velocity / 127);
      }

      // MIDI "note off" message
      else if (status === 128) {
        endEnvelope(note);
      }
    },
    [startEnvelope, endEnvelope]
  );

  // Function to initialize the MIDI API
  const initializeMIDI = useCallback(async () => {
    if (!navigator.requestMIDIAccess) {
      console.log('WebMIDI is not supported in this browser.');
      return;
    }

    const midiAccess: WebMidi.MIDIAccess = await navigator.requestMIDIAccess();

    midiInputs.current.forEach((input) => {
      input.onmidimessage = () => {};
    });

    // Listen for MIDI messages on all inputs
    for (let input of midiAccess.inputs.values()) {
      input.onmidimessage = handleMIDIMessage;

      // Only add the input to the state if it's not already there

      const prevInputs = midiInputs.current;
      if (!prevInputs.has(input)) {
        const newMidiInputs = new Set(prevInputs);
        newMidiInputs.add(input);
        midiInputs.current = newMidiInputs;
      }
    }
  }, [handleMIDIMessage]);

  // Call the initializeMIDI function when the component mounts
  // useEffect(() => {
  //   console.log('doing midi')
  //   initializeMIDI();
  //   return () => {
  //     midiInputs.current.forEach((input) => {
  //       input.onmidimessage = () => { };
  //     });
  //   };
  // }, [initializeMIDI]);

  const pianoHeight = 180;

  const [modalVisible, setModalVisibility] = useState(false);
  const toggleModalVisible = () => {
    console.log('toggling visibility!');
    console.log(`modalVisible: ${modalVisible}`);
    setModalVisibility((prevVisibility) => {
      return !prevVisibility;
    });
  };

  return (
    <div className='App h-full'>
      {/* help modal */}
      {modalVisible && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4'
          onClick={toggleModalVisible}
        >
          <div
            className='bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-md z-50 overflow-auto'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='text-center'>
              <h2 className='text-2xl font-bold mb-4'>About</h2>
              <p className='mb-4'>
                Oscillator icons are created by{' '}
                <a href='https://www.flaticon.com/authors/judanna'>
                  <em className='not-italic text-primary-content hover:underline underline-offset-4'>
                    judanna
                  </em>
                </a>{' '}
              </p>
              <button className='btn' onClick={toggleModalVisible}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* navbar */}
      <nav className='px-2 pt-2 flex items-center justify-between bg-base-100'>
        <div className='navbar-start'>
          <a href='/' className='btn btn-ghost normal-case text-xl'>
            Synthesizer
          </a>
        </div>
        <div
          className='mr-2 h-8 w-8 bg-slate-900 rounded-full flex items-center justify-center hover:cursor-pointer hover:bg-slate-800'
          onClick={toggleModalVisible}
        >
          <FontAwesomeIcon icon={faQuestion} size='1x' />
        </div>
      </nav>
      <main>
        <div
          className={`flex flex-col gap-5 pt-6`}
          style={{ paddingBottom: `${pianoHeight + 16}px` }}
        >
          <div className='px-6 grid grid-cols-2 gap-2'>
            <ControlBox>
              <ControlBoxHeader text='Oscillator Type'></ControlBoxHeader>
              <select
                className='select w-full max-w-xs'
                value={oscillatorType}
                onChange={handleOscillatorTypeChange}
              >
                <option value='sine'>sine</option>
                <option value='square'>square</option>
                <option value='triangle'>triangle</option>
                <option value='sawtooth'>sawtooth</option>
              </select>
            </ControlBox>

            <ControlBox>
              <ControlBoxHeader text={`Gain: ${volume}`}></ControlBoxHeader>
              <input
                type='range'
                min={0}
                max='100'
                value={volume}
                className='range'
                onChange={handleVolumeChange}
              />
            </ControlBox>

            <ControlBox>
              <ControlBoxHeader text='Amplitude Envelope'></ControlBoxHeader>
              <div className='flex gap-6'>
                <SingleKnobControl
                  text='Attack'
                  defaultVal={0.01}
                  minVal={0.01}
                  maxVal={1}
                  step={0.01}
                  sensitivity={0.25}
                  onChange={handleAttackChange}
                ></SingleKnobControl>
                <SingleKnobControl
                  text='Decay'
                  defaultVal={0.01}
                  minVal={0.01}
                  maxVal={1}
                  step={0.01}
                  sensitivity={0.25}
                  onChange={handleDecayChange}
                ></SingleKnobControl>
                <SingleKnobControl
                  text='Sustain'
                  defaultVal={0.01}
                  minVal={0.01}
                  maxVal={1}
                  step={0.01}
                  sensitivity={0.25}
                  onChange={handleSustainChange}
                ></SingleKnobControl>
                <SingleKnobControl
                  text='Release'
                  defaultVal={0.01}
                  minVal={0.01}
                  maxVal={1}
                  step={0.01}
                  sensitivity={0.25}
                  onChange={handleReleaseChange}
                ></SingleKnobControl>
              </div>
            </ControlBox>

            <ControlBox>
              <ControlBoxHeader text='Filter'></ControlBoxHeader>
              <div className='flex gap-6'>
                <SingleKnobControl
                  text='Freq'
                  defaultVal={350}
                  minVal={20}
                  maxVal={2000}
                  step={5}
                  sensitivity={0.5}
                  onChange={handleFilterFrequencyChange}
                ></SingleKnobControl>
                <SingleKnobControl
                  text='Resonance'
                  defaultVal={1}
                  minVal={0.1}
                  maxVal={10}
                  step={0.1}
                  sensitivity={0.5}
                  onChange={handleFilterQChange}
                ></SingleKnobControl>
              </div>
            </ControlBox>
          </div>
        </div>
        <div
          className={`fixed bottom-0 w-full`}
          style={{ height: `${pianoHeight}px` }}
        >
          <Piano
            mouseDownCallbackCreator={(note: number) => {
              const callback: MouseEventHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                startEnvelope(note, 0.7);
              };
              return callback;
            }}
            mouseUpCallbackCreator={(note: number) => {
              const callback: MouseEventHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                activeNotes.forEach((_, note) => endEnvelope(note));
              };
              return callback;
            }}
          ></Piano>
        </div>
      </main>
    </div>
  );
}

export default App;
