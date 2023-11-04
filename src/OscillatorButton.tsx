import { FormEventHandler } from 'react';

export default function OscillatorButton(props: {
  src: string;
  onChange: FormEventHandler;
  selected: boolean;
  text: string;
}) {
  return (
    <div className='flex flex-col items-center gap-2'>
      <div
        className={`bg-slate-500 h-auto rounded-lg  hover:cursor-pointer  ${
          props.selected
            ? 'bg-accent-focus opacity-20'
            : 'opacity-75 hover:bg-slate-700'
        } transition-all duration-150 ease-in-out flex flex-col justify-center items-center px-2 py-2 drop-shadow-sm`}
        onMouseDown={props.onChange}
      >
        <img
          src={props.src}
          alt='Sine Wave Oscillator'
          className={`object-contain max-h-full max-w-[40px] tablet:max-w-[75px] desktop::max-h-[100px]`}
        />
      </div>
      <span className={`text-sm tracking-wider`}>{props.text}</span>
    </div>
  );
}
