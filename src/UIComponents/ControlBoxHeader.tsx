import {ReactNode} from "react";

export default function ControlBoxHeader(props: { text: string, children?: ReactNode }) {
    return (
        <div className="flex p-2 pb-6 text-xl font-semibold tracking-wider gap-6">
            <h2>
                {props.text}
            </h2>
            {props.children}
        </div>
    );
}
