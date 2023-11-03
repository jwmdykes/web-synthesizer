import { useState, useCallback, useEffect } from 'react';
import { ReactComponent as DialBackground } from './svg1.svg';
import { ReactComponent as DialForeground } from './svg2.svg';
import { start } from 'repl';

// Helper function to calculate rotation based on mouse movement
function calculateRotation(e: any) {
  // Implement logic to calculate rotation based on mouse position
  // This would typically involve finding the angle between the center of the knob
  // and the cursor position, then mapping that angle to a value
  return 0; // placeholder
}

// Helper function to convert the calculated rotation to a value
function convertRotationToValue(
  rotation: number,
  minVal: number,
  maxVal: number
) {
  // Map the rotation angle to a value within your range (minVal to maxVal)
  return minVal; // placeholder
}

// Define a type for the component's props
type KnobProps = {
  maxVal: number;
  minVal: number;
  defaultVal: number;
};

const Knob: React.FC<KnobProps> = ({ maxVal, minVal, defaultVal }) => {
  const [currVal, setCurrVal] = useState(defaultVal);
  const [rotation, setRotation] = useState(300);
  const [isDragging, setIsDragging] = useState(false);

  const startDrag = useCallback((e: any) => {
    // Prevent default interaction
    e.preventDefault();
    setIsDragging(true);
    // You may want to add more code here to set the initial state for dragging
  }, []);

  const onDrag = useCallback(
    (e: any) => {
      if (isDragging) {
        // Calculate the rotation here and update currVal accordingly
        // This is a placeholder for the actual logic you will need
        const rotation = calculateRotation(e);
        const newVal = convertRotationToValue(rotation, minVal, maxVal);
        setCurrVal(newVal);
      }
    },
    [isDragging, minVal, maxVal]
  );

  const endDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners when dragging starts and remove them when it ends
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', endDrag);
    }

    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', endDrag);
    };
  }, [isDragging, onDrag, endDrag]);

  return (
    <div className='flex flex-col items-start'>
      <div className='flex flex-col items-center'>
        <span className='mb-2'>{currVal}</span>
        <div
          className='relative w-16 h-16'
          onMouseDown={startDrag}
          onMouseUp={endDrag}
          onMouseMove={onDrag}
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
        <span>{rotation}</span>
        <input
          type='range'
          min={-130}
          max={38}
          value={rotation}
          className='range m-5'
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setRotation(Number(event.target.value));
          }}
        />
      </div>
    </div>
  );
};

export default Knob;
