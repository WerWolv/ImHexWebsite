import "./WindowDescription.css"
import React from "react";
import {BadgeInfoIcon} from "lucide-react";
import arrowImage from "./assets/arrow.png";

function WindowDescription() {
    return (
        <>
            <div className={"imhex-web-description"}>
                <div className={"imhex-web-box flex items-start text-left flex-row bg-gray-800"}>
                    <BadgeInfoIcon className={"flex-1/4"}></BadgeInfoIcon>
                    <div className={"p-2"}></div>
                    ImHex runs on every OS and even directly in the browser!
                </div>
                <img className={"imhex-web-arrow"} src={arrowImage} style={{ marginLeft: "-10px", paddingTop: "10px", width: "80%" }} draggable={"false"}/>
            </div>
        </>
    )
}

export default WindowDescription
