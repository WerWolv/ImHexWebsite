import './App.css'
import Header from "./Header.jsx";
import Window from "./Window.jsx";
import DownloadSection from "./DownloadSection.jsx";

function App() {
  return (
    <>
        <Header></Header>
        <Window></Window>
        <p className="text-8xl pt-10 font-bold text-white">ImHex</p>
        <p className="font-normal text-gray-300">A modern, featureful Hex Editor for Reverse Engineers and Developers</p>
        <DownloadSection></DownloadSection>
    </>
  )
}

export default App
