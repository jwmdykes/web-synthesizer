import { useState, useCallback, useEffect, MouseEventHandler } from 'react';
import { ReactComponent as DialBackground } from './svg1.svg';
import { ReactComponent as DialForeground } from './svg2.svg';

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
    maxRotationDeg: number
  ) => {
    // First, clamp the rotation within the allowed range
    const clampedRotation = Math.min(
      Math.max(rotation, minRotationDeg),
      maxRotationDeg
    );

    // Calculate the total range of rotation
    const rotationRange = maxRotationDeg - minRotationDeg;

    // Calculate how far along that range the current rotation is, as a percentage
    const rotationPercentage =
      (clampedRotation - minRotationDeg) / rotationRange;

    // Now calculate the value range
    const valueRange = maxVal - minVal;

    // Apply the percentage to the value range
    const value = rotationPercentage * valueRange + minVal;

    return Math.round(value);
  };

// Define a type for the component's props
type KnobProps = {
  maxVal: number;
  minVal: number;
  defaultVal: number;
  sensitivity: number;
};

const Knob: React.FC<KnobProps> = ({ maxVal, minVal, defaultVal, sensitivity }) => {
  const minRotationDeg = -130;
  const maxRotationDeg = 40;
  const [currVal, setCurrVal] = useState(defaultVal);
  const [rotation, setRotation] = useState(convertValueToRotation(defaultVal, minVal, maxVal, minRotationDeg, maxRotationDeg)); // Initial rotation
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
          maxRotationDeg
        ); // Convert rotation to value
        setCurrVal(newVal); // Set the new value
      }
    },
    [isDragging, startY, startRotation, minVal, maxVal, sensitivity]
  );

  const endDrag = useCallback(() => {
    setIsDragging(false);
  }, []);



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
        <div className='relative w-16 h-16' onMouseDown={startDrag}>
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
        <span>{currVal}</span>
        {/* <input
          type='range'
          min={minRotationDeg}
          max={maxRotationDeg}
          value={rotation}
          className='range m-5'
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setRotation(Number(event.target.value));
          }}
        /> */}
      </div>
    </div>
  );
};

export default Knob;
