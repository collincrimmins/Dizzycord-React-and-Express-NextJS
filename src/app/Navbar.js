import React, {useState, useEffect} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { useAuthContext } from './AuthContext'
import "./css/App.css"
import "./css/Navbar.css"
import DizzycordIcon from "./images/Dizzycord.png"

export default function Navbar() {
    const {User, logout} = useAuthContext()
    //const navigate = useNavigate()
    const router = useRouter();

    function navigateToLogin() {
        //navigate("/login")
        router.push('/login')
    }

    return (
        <nav className="Navbar">
            <Link href="/" className="HomeNavbarItem">   
                <img src={DizzycordIcon} alt="..." className="AppHeaderLogo"/>
            </Link>
            <ul>
                {User && (
                    <>
                        <Link href="/tasks" className="NavbarItem">Todos</Link>
                        <Link href="/settings" className="NavbarItem">Settings</Link>
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

// function ViewPage({to, children, ...props}) {
//     return (
//         <>{children}</>
//     )
//     // const resolvedPath = useResolvedPath(to)
//     // const isActive = useMatch({path:resolvedPath.pathname, end:true})
//     // return (
//     //     <li className={isActive ? "active" : ""}>
//     //         <Link to={to} {...props}> {children} </Link>
//     //     </li>
//     // )
// }