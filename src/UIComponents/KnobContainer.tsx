import { ComponentProps } from 'react';

function KnobContainer({
  children,
  ...props
}: Omit<ComponentProps<'div'>, 'className'>) {
  return (
    <div className="grid grid-cols-2 gap-6 w-full justify-between" {...props}>
      {children}
    </div>
  );
}

export default KnobContainer;
