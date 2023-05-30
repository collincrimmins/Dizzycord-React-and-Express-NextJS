import React, {useState, useEffect, useRef} from 'react'
import { useAuthContext } from '../AuthContext'
import GoogleIcon from "../images/Google.png"
import "../css/Login.css"
import { useRouter } from 'next/navigation';

export default function LoginBox({viewSignup, viewResetPassword}) {
    const {login, loginWithGoogle, signup} = useAuthContext()
    const emailRef = useRef()
    const passwordRef = useRef()

    const [emptyFields, setEmptyFields] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    //const navigate = useNavigate()
    const router = useRouter();

    function loginSuccess() {
        //navigate("/")
        router.push('/')
    }

    async function handleSubmit(e) {
        e.preventDefault()
        let email = emailRef.current.value
        let password = passwordRef.current.value
        // Check Fields
        let invalidInput = false
        setEmptyFields("")
        if (email == "") {
            invalidInput = true
            setEmptyFields((prevState) => (prevState + " email"))
        }
        if (password == "") {
            invalidInput = true
            setEmptyFields((prevState) => (prevState + " password"))
        }
        if (invalidInput) {
            return setError("Fill in Missing Fields.")
        }
        // Set Loading
        setLoading(true)
        setError("")
        // Testing Mode (create Account on Login Button)
        let TestingCreatedAccount = sessionStorage.getItem("TestingCreatedAccount")
        if (process.env.NEXT_PUBLIC_DEV === "true" && !TestingCreatedAccount) {
            signup(email, password) // await signup(emailRef.current.value, passwordRef.current.value)
            .then((userCredential) => {
                const user = userCredential.user;
                //navigate("/")
                router.push('/')
            })
            .finally(() => {
                setLoading(false)
                sessionStorage.setItem("TestingCreatedAccount", true)
            })
            return
        }
        // Login
        login(email, password) // await login(emailRef.current.value, passwordRef.current.value)
        .then((userCredential) => {
            const user = userCredential.user;
            //console.log("Logged in: " + user.email)
            loginSuccess()
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            if (errorCode == "auth/wrong-password" || errorCode == "auth/user-not-found") {
                setError("The Email & Password combination is not valid.")
            } else {
                setError("Error.")
            }
            console.log(errorCode)
            console.log(errorMessage)
        })
        .finally(() => {
            setLoading(false)
        })
    }

    function clickedLoginWithGoogle(e) {
        e.preventDefault()

        setLoading(true)

        loginWithGoogle()
        .then((userCredential) => {
            const user = userCredential.user;
            //console.log("Logged in: " + user.email)
            loginSuccess()
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode)
            console.log(errorMessage)
        })

        setLoading(false)
    }
    
    return (
        <div className="BodyLogin CenterDivColumn">
            <div className="HeaderMain">Login</div>
            <form className="ContainerCentered">
                <label>Email:</label>
                <input
                    type="email"
                    className={"Input " + (emptyFields.includes("email") ? "InputError" : "")} 
                    ref={emailRef}
                />

                <label>Password:</label>
                <input
                    type="password"
                    className={"Input " + (emptyFields.includes("password") ? "InputError" : "")} 
                    ref={passwordRef}
                />

                <button className="ButtonRounded ButtonGray ButtonBold ButtonTextLarge" onClick={handleSubmit} disabled={loading}>Login</button>
                
                {error && 
                    <div className="ContainerError">
                        {error}
                    </div>
                }

                Forgot Password?
                <button onClick={viewResetPassword} className="ButtonRounded ButtonBlue">Reset Password</button>
                <div className="ButtonRounded ButtonLightGray ButtonOutlineBlack ButtonTextLarge LoginGoogleBox CenterDivRow" onClick={clickedLoginWithGoogle} disabled={loading}>
                    <img src={GoogleIcon} className="GoogleImage"/>
                    <div>Login with Google</div>
                </div>
            </form>
            <div className="ContainerCentered">
                Need an Account?
                <button onClick={viewSignup} className="ButtonRounded ButtonBlack ButtonBold ButtonTextLarge SignUpButton">Sign Up</button>
            </div>
        </div>
    )
}
