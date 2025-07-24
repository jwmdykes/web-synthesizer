import React, {
  useState,
  useCallback,
  useEffect,
  MouseEventHandler,
} from "react";
import { ReactComponent as DialBackground } from "../assets/dialbackground.svg";
import { ReactComponent as DialForeground } from "../assets/dialforeground.svg";

function round(value: number, step: number) {
  const inv = 1.0 / step;
  return Math.round(value * inv) / inv;
}

function getDecimalPlaces(number: number) {
  if (Math.floor(number) === number) return 0;
  const parts = number.toString().split(".");
  if (parts.length < 2) return 0;
  return parts[1].length || 0;
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

  // Avoid division by zero if valueRange is 0 (minVal === maxVal)
  if (valueRange === 0) {
    return minRotationDeg; // Or some default if range is zero
  }

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

  // Avoid division by zero if rotationRange is 0
  if (rotationRange === 0) {
    return round(minVal, step); // Or some default
  }

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
  // Optional label prop
  label?: string;
};

const Knob: React.FC<KnobProps> = ({
  maxVal,
  minVal,
  defaultVal,
  step,
  sensitivity,
  onChange,
  label, // Destructure label
}) => {
  const minRotationDeg = -130;
  const maxRotationDeg = 40;
  const stepDecimalPlaces = getDecimalPlaces(step);

  // `currVal` will hold the committed value (updated on release)
  const [currVal, setCurrValInternal] = useState(defaultVal);
  // `draftValue` will hold the value that updates during drag
  const [draftValue, setDraftValue] = useState(defaultVal);

  // Initial rotation based on defaultVal
  const [rotation, setRotation] = useState(
    convertValueToRotation(
      defaultVal,
      minVal,
      maxVal,
      minRotationDeg,
      maxRotationDeg
    )
  );
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startRotation, setStartRotation] = useState(0);

  const onChangeRef = React.useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const commitValue = useCallback((val: number) => {
    setCurrValInternal(val);
    onChangeRef.current(val);
  }, []);

  const startDrag: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setStartY(e.clientY);
      setStartRotation(rotation);
      setDraftValue(currVal);
    },
    [rotation, currVal]
  );

  const onDrag = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const deltaY = (startY - e.clientY) * sensitivity; // Calculate the change in Y

        const newRotation = Math.max(
          Math.min(startRotation + deltaY, maxRotationDeg),
          minRotationDeg
        );
        setRotation(newRotation); // Update rotation continuously

        const newVal = convertRotationToValue(
          newRotation,
          minVal,
          maxVal,
          minRotationDeg,
          maxRotationDeg,
          step
        );
        setDraftValue(newVal); // Update draft value continuously
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
      maxRotationDeg,
      step,
    ]
  );

  const endDrag = useCallback(() => {
    setIsDragging(false);
    // On drag end, commit the draft value to currVal and trigger onChange
    commitValue(draftValue);
  }, [draftValue, commitValue]);

  const resetValues = useCallback(() => {
    setRotation(
      convertValueToRotation(
        defaultVal,
        minVal,
        maxVal,
        minRotationDeg,
        maxRotationDeg
      )
    );
    commitValue(defaultVal);
    setDraftValue(defaultVal);
  }, [defaultVal, maxVal, minRotationDeg, minVal, commitValue]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDrag(e);
    };
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      endDrag();
    };

    if (isDragging) {
      window.addEventListener("pointermove", handleMouseMove);
      window.addEventListener("pointerup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("pointerup", handleMouseUp);
    };
  }, [isDragging, onDrag, endDrag]);

  useEffect(() => {
    setDraftValue(defaultVal);
    setCurrValInternal(defaultVal);
    setRotation(
      convertValueToRotation(
        defaultVal,
        minVal,
        maxVal,
        minRotationDeg,
        maxRotationDeg
      )
    );
  }, [defaultVal, minVal, maxVal, minRotationDeg, maxRotationDeg]);

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-16 h-16 touch-none"
        onPointerDown={startDrag}
        onDoubleClick={resetValues}
      >
        <div className="absolute inset-0 flex">
          <DialBackground className="fill-slate-700 w-full h-full"></DialBackground>
        </div>
        <div className="absolute inset-0">
          <DialForeground
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "50% 62.5%",
            }}
            className={`fill-slate-200 rotate-0 ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            } w-full h-full `}
          ></DialForeground>
        </div>
      </div>
      {label && <span className="text-xs mt-1 text-gray-400">{label}</span>}{" "}
      <span className="text-sm font-mono mt-1">
        {draftValue.toFixed(stepDecimalPlaces)}
      </span>
    </div>
  );
};

export default Knob;
