import React, {useState, useRef} from 'react'
import { useAuthContext } from '../AuthContext'
import "../css/Login.css"
import { useRouter } from 'next/navigation';

export default function SignupBox({viewLogin}) {
    const {signup} = useAuthContext()
    const emailRef = useRef()
    const passwordRef = useRef()
    const passwordConfirmationRef = useRef()

    const [emptyFields, setEmptyFields] = useState([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    //const navigate = useNavigate()
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault()
        let email = emailRef.current.value
        let password = passwordRef.current.value
        let passwordConfirm = passwordConfirmationRef.current.value
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
        if (passwordConfirm == "") {
            invalidInput = true
            setEmptyFields((prevState) => (prevState + " confirmPassword"))
        }
        if (invalidInput) {
            return setError("Fill in Missing Fields.")
        }

        if (password !== passwordConfirm) {
            return setError("Passwords do not match.")
        }
        // Set Loading
        setLoading(true)
        setError("")
        // Signup
        signup(email, password) // await signup(emailRef.current.value, passwordRef.current.value)
        .then((userCredential) => {
            const user = userCredential.user;
            //console.log("Signed up: " + user.email)
            //navigate("/")
            router.push('/')
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            if (errorCode == "auth/email-already-in-use") {
                setError("Email already in use.")
            } else if (errorCode == "auth/weak-password") {
                setError("Password must be atleast 6 characters long.")
            } else {
                setError("Error creating an Account.")
            }
            console.log("Error Creating User Account:")
            console.log(errorCode)
            console.log(errorMessage)
        })
        .finally(() => {
            setLoading(false)
        })
    }

    return (
        <div className="BodyLogin CenterDivColumn">
            <div className="HeaderMain">Create an Account</div>
            <form className="ContainerCentered" onSubmit={handleSubmit}>
                <div className="HeaderMain">Sign Up</div>

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

                <label>Confirm Password:</label>
                <input
                    type="password"
                    className={"Input " + (emptyFields.includes("confirmPassword") ? "InputError" : "")} 
                    ref={passwordConfirmationRef}
                />

                <div className="CenterItems">
                    <button className="ButtonRounded ButtonGray ButtonBold ButtonTextLarge" disabled={loading}>Sign Up</button>
                </div>
                {error && 
                    <div className="ContainerError">
                        {error}
                    </div>
                }
            </form>
            <div className="ContainerCentered">
                Already have an Account?
                <button onClick={viewLogin} className="ButtonRounded ButtonBlack ButtonBold ButtonTextLarge">Login</button>
            </div>
        </div>
    )
}
