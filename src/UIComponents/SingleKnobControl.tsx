import Knob from './Knob';

export default function SingleKnobControl(props: {
  text: string;
  onChange: (val: number) => void;
  maxVal: number;
  minVal: number;
  defaultVal: number;
  step: number;
  sensitivity: number;
}) {
  return (
    <div className='flex flex-col items-center'>
      <h3>{props.text}</h3>
      <Knob
        defaultVal={props.defaultVal}
        minVal={props.minVal}
        maxVal={props.maxVal}
        step={props.step}
        sensitivity={props.sensitivity}
        onChange={props.onChange}
      ></Knob>
    </div>
  );
}
