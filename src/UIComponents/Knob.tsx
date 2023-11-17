import { useState, useCallback, useEffect, MouseEventHandler } from 'react';
import { ReactComponent as DialBackground } from '../assets/dialbackground.svg';
import { ReactComponent as DialForeground } from '../assets/dialforeground.svg';

function round(value: number, step: number) {
  step || (step = 1.0);
  var inv = 1.0 / step;
  return Math.round(value * inv) / inv;
}

// Function to determine the number of decimal places
function getDecimalPlaces(number: number) {
  if (Math.floor(number) === number) return 0;
  return number.toString().split('.')[1].length || 0;
}

// Convert a value to a rotation degree between minRotationDeg and maxRotationDeg
const convertValueToRotation = (
  value: number,
  minVal: number,
  maxVal: number,
  minRotationDeg: number,
  maxRotationDeg: number
): number => {
  // First, clamp the value within the allowed range
  const clampedValue = Math.min(Math.max(value, minVal), maxVal);

  // Calculate the total range of possible values
  const valueRange = maxVal - minVal;

  // Calculate how far along that range the current value is, as a percentage
  const valuePercentage = (clampedValue - minVal) / valueRange;

  // Now calculate the rotation range
  const rotationRange = maxRotationDeg - minRotationDeg;

  // Apply the percentage to the rotation range
  const rotation = valuePercentage * rotationRange + minRotationDeg;

  return rotation;
};

// Convert the rotation to a value between minVal and maxVal
const convertRotationToValue = (
  rotation: number,
  minVal: number,
  maxVal: number,
  minRotationDeg: number,
  maxRotationDeg: number,
  step: number
) => {
  // First, clamp the rotation within the allowed range
  const clampedRotation = Math.min(
    Math.max(rotation, minRotationDeg),
    maxRotationDeg
  );

  // Calculate the total range of rotation
  const rotationRange = maxRotationDeg - minRotationDeg;

  // Calculate how far along that range the current rotation is, as a percentage
  const rotationPercentage = (clampedRotation - minRotationDeg) / rotationRange;

  // Now calculate the value range
  const valueRange = maxVal - minVal;

  // Apply the percentage to the value range
  let value = rotationPercentage * valueRange + minVal;

  // Round to the nearest increment of the step
  value = round(value, step);

  return value;
};

// Define a type for the component's props
type KnobProps = {
  maxVal: number;
  minVal: number;
  defaultVal: number;
  step: number;
  sensitivity: number;
  onChange: (val: number) => void;
};

const Knob: React.FC<KnobProps> = ({
  maxVal,
  minVal,
  defaultVal,
  step,
  sensitivity,
  onChange,
}) => {
  const minRotationDeg = -130;
  const maxRotationDeg = 40;
  const stepDecimalPlaces = getDecimalPlaces(step);
  const [currVal, _setCurrVal] = useState(defaultVal);

  const setCurrVal = useCallback(
    (val: number) => {
      _setCurrVal(val);
      onChange(val);
    },
    [onChange]
  );

  const [rotation, setRotation] = useState(
    convertValueToRotation(
      defaultVal,
      minVal,
      maxVal,
      minRotationDeg,
      maxRotationDeg
    )
  ); // Initial rotation
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0); // Starting Y position for the drag
  const [startRotation, setStartRotation] = useState(0); // Starting rotation at the beginning of the drag

  const startDrag: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(true);
      setStartY(e.clientY); // Set the start Y position
      setStartRotation(rotation); // Set the start rotation
    },
    [rotation]
  );

  const onDrag = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const deltaY = (startY - e.clientY) * sensitivity; // Calculate the change in Y

        const newRotation = Math.max(
          Math.min(startRotation + deltaY, maxRotationDeg),
          minRotationDeg
        ); // Calculate the new rotation, clamp between 0 and 360
        setRotation(newRotation); // Set the new rotation
        const newVal = convertRotationToValue(
          newRotation,
          minVal,
          maxVal,
          minRotationDeg,
          maxRotationDeg,
          step
        ); // Convert rotation to value
        setCurrVal(newVal); // Set the new value
      }
    },
    [
      isDragging,
      startY,
      startRotation,
      minVal,
      maxVal,
      sensitivity,
      minRotationDeg,
      setCurrVal,
      step,
    ]
  );

  const endDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetValues = useCallback(() => {
    setCurrVal(defaultVal);
    setRotation(
      convertValueToRotation(
        defaultVal,
        minVal,
        maxVal,
        minRotationDeg,
        maxRotationDeg
      )
    );
  }, [defaultVal, maxVal, minRotationDeg, minVal, setCurrVal]);

  // Add event listeners when dragging starts and remove them when it ends
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => onDrag(e);
    const handleMouseUp = () => endDrag();

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onDrag, endDrag]);

  return (
    <div className='flex flex-col items-start'>
      <div className='flex flex-col items-center'>
        <div
          className='relative w-16 h-16'
          onMouseDown={startDrag}
          onDoubleClick={resetValues}
        >
          <div className='absolute inset-0 flex'>
            <DialBackground className='fill-slate-700 w-full h-full'></DialBackground>
          </div>
          <div className='absolute inset-0'>
            <DialForeground
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: '50% 62.5%',
              }}
              className={`fill-slate-200 rotate-0 hover:${
                isDragging ? 'cursor-move' : 'cursor-grab'
              } w-full h-full `}
            ></DialForeground>
          </div>
        </div>
        <span>{currVal.toFixed(stepDecimalPlaces)}</span>
      </div>
    </div>
  );
};

export default Knob;
