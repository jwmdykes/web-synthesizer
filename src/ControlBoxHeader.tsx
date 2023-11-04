export default function ControlBoxHeader(props: { text: string }) {
  return (
    <h2 className='p-2 pb-6 text-xl font-semibold tracking-wider'>
      {props.text}
    </h2>
  );
}
