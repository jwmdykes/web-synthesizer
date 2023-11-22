import {ReactNode} from "react";

export default function (props: { children: ReactNode }) {
    return (
        <div className="grid grid-cols-3 gap-6 w-full justify-between">
            {props.children}
        </div>
    )
}