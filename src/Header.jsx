import "./Header.css"
import {GithubIcon, BookText, MessageSquareText} from 'lucide-react';


function Header() {
    return (
        <>
            <div className={"header"}>
                <div className={"header-item-start text-4xl font-bold"}>ImHex</div>
                <a href={"https://github.com/WerWolv/ImHex"}><GithubIcon className={"header-item-end header-icon text-2xl"}><title>GitHub Repository</title></GithubIcon></a>
                <a href={"https://docs.werwolv.net/imhex"}><BookText className={"header-item-end header-icon text-2xl"}><title>Documentation</title></BookText></a>
                <a href={"https://discord.gg/X63jZ36xBY"}><MessageSquareText className={"header-item-end header-icon text-2xl"}><title>Discord Server</title></MessageSquareText></a>
            </div>
        </>
    )
}

export default Header
