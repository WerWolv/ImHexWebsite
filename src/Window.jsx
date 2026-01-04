import "./Window.css"
import WindowDescription from "./WindowDescription.jsx";

import { useEffect, useRef } from 'react';

function loadLibrary(src, doAsync) {
    const script = document.createElement('script');
    script.src = src;
    script.async = doAsync;

    document.body.appendChild(script);

    return script
}

function Window() {
    const canvasRef = useRef(null);
    const scriptLoadedRef = useRef(false);

    useEffect(() => {
        let wasmConfig, imhexWasm;
        requestAnimationFrame(() => {
            const canvas = document.getElementById('canvas');
            if (!canvas) {
                console.error('Canvas not found');
                return;
            }

            if (scriptLoadedRef.current) {
                return;
            }
            scriptLoadedRef.current = true;

            wasmConfig = loadLibrary("wasm-config.js", false);
            imhexWasm = loadLibrary("imhex.js", true);
        });
        return () => {
            if (imhexWasm != null)
                document.body.removeChild(imhexWasm);
            if (wasmConfig != null)
            document.body.removeChild(wasmConfig);
        };
    }, []);

    return (
        <>
            <div className={"window-frame"}>
                <div className="imhex-web-canvas-wrapper">
                    <canvas className="imhex-web-canvas" id="canvas" ref={canvasRef} onContextMenu={event?.preventDefault()}></canvas>
                </div>
                <div className={"window-frame-controls"}>
                    <svg className={"window-frame-svg"}>
                        <circle cx="14" cy="14" r="6" fill={"#FF605C"}/>
                        <circle cx="35" cy="14" r="6" fill={"#ffbd44"}/>
                        <circle cx="56" cy="14" r="6" fill={"#00ca4e"}/>
                    </svg>
                </div>
                <WindowDescription></WindowDescription>
            </div>
        </>
    )
}

export default Window
