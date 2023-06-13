import React, {useState, useEffect} from 'react'
import Link from 'next/link'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuthContext } from './Authentication'
import "./css/App.css"
import "./css/Navbar.css"
import DizzycordIcon from "@/app/images/Dizzycord.png"
import PlaceholderImage from "@/app/images/PlaceholderImage.png"
import GoogleImage from "@/app/images/Google.png"

export default function Navbar() {
    const {User, logout} = useAuthContext()
    const router = useRouter();
    const pathname = usePathname();

    const [dropdownActive, setDropdownActive] = useState(true)

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

    function clickedAccountButton () {
        if (dropdownActive) {
            // Hide Menu
            setDropdownActive(false)
        } else {
            // Enable Menu
            setDropdownActive(true)
        }
    }
    
    function navigateToSettings() {
        // Navigate
        router.push("/settings")
        // Hide Menu
        setDropdownActive(false)
    }

    return (
        <>
            <nav className="Navbar">
                <Link href="/" className="HomeNavbarItem">   
                    <Image src={DizzycordIcon} alt="..." className="AppHeaderLogo" />
                </Link>
                <ul>
                    {User && (
                        <>
                            <ViewPageButton dest="/users">Profile</ViewPageButton>
                            <ViewPageButton dest="/chat">Chat</ViewPageButton>
                            {/* <ViewPageButton dest="/tasks">Todos</ViewPageButton> */}
                            {/* <ViewPageButton dest="/settings">Settings</ViewPageButton> */}
                            {/* <button onClick={logout} className="ButtonRounded ButtonRed ButtonBold ButtonTextLarge AccountButton"> Logout </button> */}
                            <button onClick={clickedAccountButton} className="AccountFrame">
                                <Image src={GoogleImage} alt="..." className="ProfilePhoto AccountProfileIcon" />
                                User
                            </button>
                        </>
                    )}
                    {!User && (
                        <Link href="/login" className="HomeNavbarItem">
                            <button className="ButtonRounded ButtonRed ButtonBold ButtonTextLarge AccountButton"> Login </button>
                        </Link>
                    )}
                </ul>
            </nav>
            {dropdownActive && (
                <div className="DropdownMenu">
                    <div className="DropdownMenuHeader">Account</div>
                    <ul>
                        <div className="MenuDivider"/>
                        <button onClick={navigateToSettings}>Settings</button>
                        <div className="MenuDivider"/>
                        <button onClick={logout}>Sign Out</button>
                    </ul>
                </div>
            )}
        </>
    )
}