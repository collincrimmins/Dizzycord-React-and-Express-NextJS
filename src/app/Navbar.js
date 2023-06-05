import React, {useState, useEffect} from 'react'
import Link from 'next/link'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuthContext } from './Authentication'
import "./css/App.css"
import "./css/Navbar.css"
import DizzycordIcon from "./images/Dizzycord.png"

export default function Navbar() {
    const {User, logout} = useAuthContext()
    const router = useRouter();
    const pathname = usePathname();

    // Button that will be Underlined when Page Active
    const ViewPageButton = ({dest, children}) => {
        // Check Page Active
        let pageActive = false
        if (dest === pathname) {
            pageActive = true
        }
        // Mark Link as Active or not Active
        return (
            <Link href={dest} className={`NavbarItem ${pageActive ? "NavbarItemActive" : ""}`}> {children} </Link>
        )
    }

    return (
        <nav className="Navbar">
            <Link href="/" className="HomeNavbarItem">   
                <Image src={DizzycordIcon} alt="..." className="AppHeaderLogo" />
            </Link>
            <ul>
                {User && (
                    <>
                        <ViewPageButton dest="/users">Profile</ViewPageButton>
                        <ViewPageButton dest="/chat">Chat</ViewPageButton>
                        <ViewPageButton dest="/tasks">Todos</ViewPageButton>
                        <ViewPageButton dest="/settings">Settings</ViewPageButton>
                        <button onClick={logout} className="ButtonRounded ButtonRed ButtonBold ButtonTextLarge AccountButton"> Logout </button>
                    </>
                )}
                {!User && (
                    <Link href="/login" className="HomeNavbarItem">
                        <button className="ButtonRounded ButtonRed ButtonBold ButtonTextLarge AccountButton"> Login </button>
                    </Link>
                )}
            </ul>
        </nav>
    )
}