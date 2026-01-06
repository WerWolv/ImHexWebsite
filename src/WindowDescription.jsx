import "./WindowDescription.css"
import React from "react";
import {ArrowUpLeftFromSquareIcon} from "lucide-react";
import arrowImage from "./assets/arrow.png";

function WindowDescription() {
    return (
        <>
            <div className={"imhex-web-description"}>
                <div className={"imhex-web-box flex items-center flex-col bg-gray-700"}>
                    Try out ImHex in the browser!
                    <div className={"p-1"}></div>
                    <a href={"https://web.imhex.werwolv.net"} draggable={"false"}>
                        <button
                            className={'flex items-center gap-3 px-8 py-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105'}
                        >
                            <ArrowUpLeftFromSquareIcon className="w-5 h-5" />
                            <div className="items-start">
                                <span>ImHex Web</span>
                            </div>
                        </button>
                    </a>
                </div>
                <img className={"imhex-web-arrow"} src={arrowImage} style={{ marginLeft: "-10px", paddingTop: "10px", width: "80%" }} draggable={"false"}/>
            </div>
        </>
    )
}

export default WindowDescription
