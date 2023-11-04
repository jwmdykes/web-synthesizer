import { FormEventHandler } from 'react';

export default function OscillatorButton(props: {
  src: string;
  onChange: FormEventHandler;
  selected: boolean;
  text: string;
}) {
  return (
    <div
      className={`bg-slate-500 w-1/3 h-auto rounded-lg  hover:cursor-pointer  ${
        props.selected
          ? 'bg-accent-focus opacity-20'
          : 'opacity-75 hover:bg-slate-700'
      } transition-all duration-150 ease-in-out flex flex-col justify-center items-center px-4 py-2 drop-shadow-sm`}
      onMouseDown={props.onChange}
    >
      <img
        src={props.src}
        alt='Sine Wave Oscillator'
        className={`object-contain`}
      />
      <span className={`text-slate-900 font-medium tracking-wider select-none`}>
        {' '}
        {props.text}
      </span>
    </div>
  );
}
