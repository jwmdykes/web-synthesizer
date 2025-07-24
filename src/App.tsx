import React, {
  useEffect,
  useRef,
  useState,
  MouseEventHandler,
  MutableRefObject,
} from "react";

import { useHotkeys } from "react-hotkeys-hook";

import Piano from "./UIComponents/Piano";
import ControlBoxHeader from "./UIComponents/ControlBoxHeader";
import OscillatorButton from "./UIComponents/OscillatorButton";

import { FilterParams } from "./soundEngine/Filter";

import SingleKnobControl from "./UIComponents/SingleKnobControl";
import ControlBox from "./UIComponents/ControlBox";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion } from "@fortawesome/free-solid-svg-icons";

import sineWave from "./assets/wave-sine.png";
import squareWave from "./assets/wave-square.png";
import triangleWave from "./assets/wave-triangle.png";
import { EnvelopeParams } from "./soundEngine/Envelope";
import { SoundEngine } from "./soundEngine/SoundEngine";
import { VoiceParams } from "./soundEngine/Voice";

import defaultParams from "./SynthPresets/default";
import KnobContainer from "./UIComponents/KnobContainer";
import keyMap from "./SynthPresets/hotkeys";
import {
  ChorusEffectParams,
  ChorusParams,
  PingPongDelayProperties,
  PingPongEffectParams,
} from "./soundEngine/TunaEffect";

function App() {
  const soundEngine: MutableRefObject<SoundEngine | null> = useRef(null);
  const [volume, setVolume] = useState(defaultParams.volume);
  const [envelopeParams, setEnvelopeParams] = useState<EnvelopeParams>(
    defaultParams.envelopeParams
  );
  const [filterParams, setFilterParams] = useState<FilterParams>(
    defaultParams.filterParams
  );
  const [oscillatorType, setOscillatorType] = useState<OscillatorType>(
    defaultParams.oscillatorParams
  );
  const [chorusEffectParams, setChorusEffectParams] =
    useState<ChorusEffectParams>(defaultParams.chorusEffectParams);
  const [pingPongEffectParams, setPingPongEffectParams] =
    useState<PingPongEffectParams>(defaultParams.pingPongEffectParams);

  const pressedKeys: MutableRefObject<Map<string, boolean>> = useRef(new Map());

  useHotkeys(
    Array.from(keyMap.keys()),
    (e) => {
      const midiNote = keyMap.get(e.key);
      if (pressedKeys.current.get(e.key) || midiNote == null) return;

      pressedKeys.current.set(e.key, true);
      soundEngine.current?.play(midiNote);
    },
    {
      keydown: true,
    },
    []
  );

  useHotkeys(
    Array.from(keyMap.keys()),
    (e) => {
      const midiNote = keyMap.get(e.key);
      if (midiNote == null) return;
      pressedKeys.current.set(e.key, false);
      soundEngine.current?.stop(midiNote);
    },
    {
      keydown: false,
      keyup: true,
    },
    []
  );

  const handleFilterChange = (
    modifiedParam:
      | "LFOFrequency"
      | "LFOOscillation"
      | "LFOBypass"
      | "frequency"
      | "Q"
      | "type",
    val: number
  ) => {
    setFilterParams((prevState) => {
      let newState: FilterParams = {
        ...prevState,
        [modifiedParam]: val,
      };
      soundEngine.current?.changeFilterParams(newState);
      return newState;
    });
  };

  const handleEnvelopeChange = (
    modifiedParam: "attack" | "release" | "decay" | "sustain",
    val: number
  ) => {
    setEnvelopeParams((prevState) => {
      let newState: EnvelopeParams = {
        ...prevState,
        [modifiedParam]: Number(val),
      };
      soundEngine.current?.changeEnvelopeParams(newState);
      return newState;
    });
  };

  const handleChorusEffectChange = (
    effect: null | "chorus",
    modifiedParam: keyof ChorusParams,
    val: number
  ) => {
    setChorusEffectParams((prevState) => {
      let newState: ChorusEffectParams = {
        activeEffect: effect,
        effectParams: {
          ...prevState.effectParams,
          [modifiedParam]: val,
        },
      };
      soundEngine.current?.changeChorusEffectParams(newState);
      return newState;
    });
  };

  const handlePingPongEffectChange = (
    effect: null | "ping-pong",
    modifiedParam: keyof PingPongDelayProperties,
    val: number
  ) => {
    setPingPongEffectParams((prevState) => {
      let newState: PingPongEffectParams = {
        activeEffect: effect,
        effectParams: {
          ...prevState.effectParams,
          [modifiedParam]: val,
        },
      };
      soundEngine.current?.changePingPongEffectParams(newState);
      return newState;
    });
  };

  const handleOscillatorTypeChange = (type: OscillatorType) => {
    soundEngine.current?.changeOscillatorParams(type);
    setOscillatorType(type);
  };

  // setup sound engine class
  useEffect(() => {
    const audioContext = new AudioContext();
    const midiVoices = Array(13)
      .fill(0)
      .map((_, i) => i + 60);
    const voiceParams: VoiceParams = {
      filterParams: filterParams,
      envelopeParams: envelopeParams,
      oscillatorParams: oscillatorType,
    };
    soundEngine.current = new SoundEngine(audioContext, {
      midiVoices: midiVoices,
      chorusEffectParams: chorusEffectParams,
      pingPongEffectParams: pingPongEffectParams,
      voiceParams: voiceParams,
      volume: volume / 100,
    });
  }, []);

  const pianoHeight = 180;

  const [modalVisible, setModalVisibility] = useState(false);
  const toggleModalVisible = () => {
    setModalVisibility((prevVisibility) => {
      return !prevVisibility;
    });
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(event.target.value);
    setVolume(newVolume);
    soundEngine.current?.setVolume(volume / 100);
  };

  return (
    <div className="App h-full">
      {/* help modal */}
      {modalVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
          onClick={toggleModalVisible}
        >
          <div
            className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-md z-50 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-2xl font-bold mb-8">About</h2>
              <div className="flex flex-col gap-5 mb-6">
                <p>
                  This is a simple subtractive synthesizer created with the Web
                  Audio API.
                </p>
                <p>
                  You can control the synthesizer by clicking or tapping on the
                  virtual keyboard at the bottom of the screen, or by using the
                  keyboard keys 'a' to 'k'.
                </p>
                <p>
                  The source code can be found on&nbsp;
                  <a
                    href="https://github.com/jwmdykes/web-synthesizer"
                    title="github source code"
                  >
                    <em className="not-italic text-primary-content hover:underline underline-offset-4">
                      github.
                    </em>
                  </a>
                </p>
              </div>
              <h2 className="text-2xl font-bold mb-8">Acknowledgements</h2>
              <div className="flex flex-col gap-5">
                <p>
                  Oscillator icons created by&nbsp;
                  <a
                    href="https://www.flaticon.com/authors/iconading"
                    title="wave square icons"
                  >
                    <em className="not-italic text-primary-content hover:underline underline-offset-4">
                      iconading - Flaticon
                    </em>
                  </a>
                </p>
                <p>
                  Grand piano favicon created by&nbsp;
                  <a
                    href="https://www.flaticon.com/free-icons/grand-piano"
                    title="grand piano icons"
                  >
                    <em className="not-italic text-primary-content hover:underline underline-offset-4">
                      Andrejs Kirma - Flaticon
                    </em>
                  </a>
                </p>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  className="btn btn-primary"
                  onClick={toggleModalVisible}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* navbar */}
      <nav className="px-2 pt-2 flex items-center justify-between bg-base-100">
        <div className="navbar-start">
          <a href="/" className="btn btn-ghost normal-case text-xl">
            Synthesizer
          </a>
        </div>
        <div
          className="mr-2 h-8 w-8 bg-slate-900 rounded-full flex items-center justify-center hover:cursor-pointer hover:bg-slate-800"
          onClick={toggleModalVisible}
        >
          <FontAwesomeIcon icon={faQuestion} size="1x" />
        </div>
      </nav>
      <main>
        <div
          className={`flex flex-col gap-5 pt-6`}
          style={{ paddingBottom: `${pianoHeight + 16}px` }}
        >
          <div className="mx-auto container px-6 grid tablet:grid-cols-2 desktop:grid-cols-3 gap-2">
            <ControlBox>
              <ControlBoxHeader text="Oscillator Type"></ControlBoxHeader>
              <div className="flex flex-wrap items-center justify-center w-full gap-6 desktop:gap-12">
                <OscillatorButton
                  text="Sine"
                  src={sineWave}
                  onChange={() => handleOscillatorTypeChange("sine")}
                  selected={oscillatorType === "sine"}
                ></OscillatorButton>
                <OscillatorButton
                  src={squareWave}
                  text="Square"
                  onChange={() => handleOscillatorTypeChange("square")}
                  selected={oscillatorType === "square"}
                ></OscillatorButton>
                <OscillatorButton
                  text="Triangle"
                  src={triangleWave}
                  onChange={() => handleOscillatorTypeChange("triangle")}
                  selected={oscillatorType === "triangle"}
                ></OscillatorButton>
              </div>
            </ControlBox>

            <ControlBox>
              <ControlBoxHeader
                text={`Gain: ${volume.toFixed(0)}`}
              ></ControlBoxHeader>
              <input
                aria-label="Gain Slider"
                type="range"
                min={0}
                max={100}
                value={volume}
                className="range"
                onChange={handleVolumeChange}
              />
            </ControlBox>

            <ControlBox>
              <ControlBoxHeader text="Amplitude Envelope"></ControlBoxHeader>
              <KnobContainer>
                <SingleKnobControl
                  text="Attack"
                  defaultVal={defaultParams.envelopeParams.attack}
                  minVal={0.01}
                  maxVal={1}
                  step={0.01}
                  sensitivity={0.5}
                  onChange={(val) => handleEnvelopeChange("attack", val)}
                ></SingleKnobControl>
                <SingleKnobControl
                  text="Decay"
                  defaultVal={defaultParams.envelopeParams.decay}
                  minVal={0.01}
                  maxVal={1}
                  step={0.01}
                  sensitivity={0.5}
                  onChange={(val) => handleEnvelopeChange("decay", val)}
                ></SingleKnobControl>
                <SingleKnobControl
                  text="Sustain"
                  defaultVal={defaultParams.envelopeParams.sustain}
                  minVal={0.01}
                  maxVal={1}
                  step={0.01}
                  sensitivity={0.5}
                  onChange={(val) => handleEnvelopeChange("sustain", val)}
                ></SingleKnobControl>
                <SingleKnobControl
                  text="Release"
                  defaultVal={defaultParams.envelopeParams.release}
                  minVal={0.01}
                  maxVal={4}
                  step={0.01}
                  sensitivity={0.5}
                  onChange={(val) => handleEnvelopeChange("release", val)}
                ></SingleKnobControl>
              </KnobContainer>
            </ControlBox>

            <ControlBox>
              <ControlBoxHeader text="Filter"></ControlBoxHeader>
              <KnobContainer>
                <SingleKnobControl
                  text="Freq"
                  defaultVal={defaultParams.filterParams.frequency}
                  minVal={20}
                  maxVal={2000}
                  step={5}
                  sensitivity={0.5}
                  onChange={(val) => handleFilterChange("frequency", val)}
                ></SingleKnobControl>
                <SingleKnobControl
                  text="Resonance"
                  defaultVal={defaultParams.filterParams.Q}
                  minVal={0.1}
                  maxVal={10}
                  step={0.1}
                  sensitivity={0.5}
                  onChange={(val) => handleFilterChange("Q", val)}
                ></SingleKnobControl>
                <SingleKnobControl
                  text="LFO Freq"
                  defaultVal={defaultParams.filterParams.LFOFrequency}
                  minVal={0.1}
                  maxVal={10}
                  step={0.1}
                  sensitivity={0.5}
                  onChange={(val) => handleFilterChange("LFOFrequency", val)}
                ></SingleKnobControl>
                <SingleKnobControl
                  text="LFO Range"
                  defaultVal={defaultParams.filterParams.LFOOscillation}
                  minVal={0.1}
                  maxVal={1000}
                  step={0.1}
                  sensitivity={0.5}
                  onChange={(val) => handleFilterChange("LFOOscillation", val)}
                ></SingleKnobControl>
              </KnobContainer>
            </ControlBox>

            <ControlBox>
              <ControlBoxHeader text="Chorus">
                <input
                  aria-label="Toggle Chorus effect"
                  type="checkbox"
                  className="toggle toggle-success"
                  checked={chorusEffectParams.activeEffect != null}
                  onChange={() =>
                    handleChorusEffectChange(
                      chorusEffectParams.activeEffect == null ? "chorus" : null,
                      "rate",
                      chorusEffectParams.effectParams.rate
                    )
                  }
                />
              </ControlBoxHeader>
              <KnobContainer>
                <SingleKnobControl
                  text="Rate"
                  defaultVal={
                    defaultParams.chorusEffectParams.effectParams.rate
                  }
                  minVal={0.01}
                  maxVal={8}
                  step={0.01}
                  sensitivity={0.5}
                  onChange={(val) =>
                    handleChorusEffectChange(
                      chorusEffectParams.activeEffect,
                      "rate",
                      val
                    )
                  }
                ></SingleKnobControl>
                <SingleKnobControl
                  text="Depth"
                  defaultVal={
                    defaultParams.chorusEffectParams.effectParams.depth
                  }
                  minVal={0}
                  maxVal={1}
                  step={0.01}
                  sensitivity={0.5}
                  onChange={(val) =>
                    handleChorusEffectChange(
                      chorusEffectParams.activeEffect,
                      "depth",
                      val
                    )
                  }
                ></SingleKnobControl>
                <SingleKnobControl
                  text="Delay"
                  defaultVal={
                    defaultParams.chorusEffectParams.effectParams.delay
                  }
                  minVal={0}
                  maxVal={1}
                  step={0.01}
                  sensitivity={0.5}
                  onChange={(val) =>
                    handleChorusEffectChange(
                      chorusEffectParams.activeEffect,
                      "delay",
                      val
                    )
                  }
                ></SingleKnobControl>
                <SingleKnobControl
                  text="Feedback"
                  defaultVal={
                    defaultParams.chorusEffectParams.effectParams.feedback
                  }
                  minVal={0}
                  maxVal={0.99}
                  step={0.01}
                  sensitivity={0.5}
                  onChange={(val) =>
                    handleChorusEffectChange(
                      chorusEffectParams.activeEffect,
                      "feedback",
                      val
                    )
                  }
                ></SingleKnobControl>
              </KnobContainer>
            </ControlBox>

            <ControlBox>
              <ControlBoxHeader text="Ping Pong Delay">
                <input
                  type="checkbox"
                  className="toggle toggle-success"
                  aria-label="Toggle PingPong effect"
                  checked={pingPongEffectParams.activeEffect != null}
                  onChange={() =>
                    handlePingPongEffectChange(
                      pingPongEffectParams.activeEffect == null
                        ? "ping-pong"
                        : null,
                      "feedback",
                      chorusEffectParams.effectParams.feedback
                    )
                  }
                />
              </ControlBoxHeader>
              <KnobContainer>
                <SingleKnobControl
                  text="Left Delay"
                  defaultVal={
                    defaultParams.pingPongEffectParams.effectParams
                      .delayTimeLeft
                  }
                  minVal={0}
                  maxVal={2}
                  step={0.01}
                  sensitivity={0.5}
                  onChange={(val) =>
                    handlePingPongEffectChange(
                      pingPongEffectParams.activeEffect,
                      "delayTimeLeft",
                      val
                    )
                  }
                ></SingleKnobControl>
                <SingleKnobControl
                  text="Right Delay"
                  defaultVal={
                    defaultParams.pingPongEffectParams.effectParams
                      .delayTimeRight
                  }
                  minVal={0}
                  maxVal={2}
                  step={0.01}
                  sensitivity={0.5}
                  onChange={(val) =>
                    handlePingPongEffectChange(
                      pingPongEffectParams.activeEffect,
                      "delayTimeRight",
                      val
                    )
                  }
                ></SingleKnobControl>
                <SingleKnobControl
                  text="Wet Level"
                  defaultVal={
                    defaultParams.pingPongEffectParams.effectParams.wetLevel
                  }
                  minVal={0}
                  maxVal={0.99}
                  step={0.01}
                  sensitivity={0.5}
                  onChange={(val) =>
                    handlePingPongEffectChange(
                      pingPongEffectParams.activeEffect,
                      "wetLevel",
                      val
                    )
                  }
                ></SingleKnobControl>
                <SingleKnobControl
                  text="Feedback"
                  defaultVal={
                    defaultParams.pingPongEffectParams.effectParams.feedback
                  }
                  minVal={0}
                  maxVal={0.99}
                  step={0.01}
                  sensitivity={0.5}
                  onChange={(val) =>
                    handlePingPongEffectChange(
                      pingPongEffectParams.activeEffect,
                      "feedback",
                      val
                    )
                  }
                ></SingleKnobControl>
              </KnobContainer>
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
                soundEngine.current?.play(note);
              };
              return callback;
            }}
            mouseUpCallbackCreator={(note: number) => {
              const callback: MouseEventHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                soundEngine.current?.stop(note);
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
