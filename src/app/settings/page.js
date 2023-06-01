"use client"

import React, {useState, useEffect, useRef, useContext} from 'react';
import {useAuthContext} from "../AuthContext"
import {setFirestoreUsername, getUsernameFromUID} from '../functions/Firestore';
import "../css/App.css"
import "../css/Settings.css"
import { useRouter } from 'next/navigation';
// Firestore
import {
    collection,
    addDoc, deleteDoc, doc, getDoc, getDocs, onSnapshot,
    query, where, orderBy, limit, startAfter,
    serverTimestamp 
  } from "firebase/firestore"

export default function SettingsPage() {
    const {User, username, setUsername, updateUserEmail, updateUserPassword} = useAuthContext()
    const [usernameMessage, setUsernameMessage] = useState("")
    const [usernameError, setUsernameError] = useState("")
    const [emailMessage, setEmailMessage] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordMessage, setPasswordMessage] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [loading, setLoading] = useState(false)
    const usernameRef = useRef()
    const emailRef = useRef()
    const emailConfirmRef = useRef()
    const passwordRef = useRef()
    const passwordConfirmRef = useRef()
    const router = useRouter();

    async function submitUsernameUpdate(e) {
        e.preventDefault()
        // Loading
        if (loading) {return}
        setLoading(true)
        // Set Messages
        setUsernameMessage("")
        setUsernameError("")
        // Check Input
        let inputText = usernameRef.current.value
        // if (inputText === User.displayName) {
        //    return setUsernameError("Your Username is already " + User.displayName)
        // }
        // if (inputText === "") {
        //     return setUsernameError("Invalid Username.")
        // }
        // if (!/\S/.test(inputText)) {
        //     return setUsernameError("Invalid Username.")
        // }
        // API SetUsername
        const newUsername = usernameRef.current.value
        setFirestoreUsername(newUsername)
        .then((result) => {
            const Data = result.data
            if (Data.status === "ok") {
                // Set Username
                setUsernameMessage("Successfully set new Username.")
                setUsername(Data.Username)
            } else if (Data.status == "error") {
                // Set Error
                return setUsernameError(Data.message)
            }
        })
        .catch(() => {
            return setUsernameError("Error setting Username.")
        })
        .finally(() => {
            setLoading(false)
        })

        // firestore.collection("Users").doc(User.uid).update({
        //     username: newUsername,
        // })
        // .then(() => {
        //     setUsernameMessage("Successfully set new Username.")
        //     setUsername(newUsername)
        // })
        // .catch((error) => {
        //     const errorCode = error.code;
        //     const errorMessage = error.message;
        //     if (errorCode == "auth/email-already-in-use") {
        //         setUsernameError("Email is already in use.")
        //     } else if (errorCode == "auth/requires-recent-login") {
        //         setUsernameError("You must relogin before updating email again.")
        //     } else {
        //         setUsernameError("Error.")
        //     }
        //     console.log(errorCode)
        //     console.log(errorMessage)
        // })
        /*updateUsername(usernameRef.current.value)
        .then((outcome) => {
            setUsernameMessage("Successfully set new Username.")
            console.log(outcome)
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            if (errorCode == "auth/email-already-in-use") {
                setUsernameError("Email is already in use.")
            } else if (errorCode == "auth/requires-recent-login") {
                setUsernameError("You must relogin before updating email again.")
            } else {
                setUsernameError("Error.")
            }
            console.log(errorCode)
            console.log(errorMessage)
        })*/
    }

    function submitEmailUpdate(e) {
        e.preventDefault()

        // Set Messages
        setEmailMessage("")
        setEmailError("")

        // Check Fields
        let invalidInput = false
        if (emailRef.current.value == "") {
            invalidInput = true
        }
        if (emailConfirmRef.current.value == "") {
            invalidInput = true
        }
        if (invalidInput) {
            return setEmailError("Fill in Missing Fields.")
        }
        // Check Input
        if (emailRef.current.value !== emailConfirmRef.current.value) {
             return setEmailError("Email's do not match.")
        }
        if (emailRef.current.value === User.email) {
            return setEmailError("Your Email is already " + User.email)
        }

        // Update Email
        setLoading(true)

        updateUserEmail(emailRef.current.value)
        .then((outcome) => {
            setEmailMessage("Successfully set new Email.")
            console.log(outcome)
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            if (errorCode == "auth/email-already-in-use") {
                setEmailError("Email is already in use.")
            } else if (errorCode == "auth/requires-recent-login") {
                setEmailError("You must relogin before updating email again.")
            } else if (errorCode == "auth/invalid-email") {
                setEmailError("Input a Valid Email.")
            } else {
                setEmailError("Error.")
            }
            console.log(errorCode)
            console.log(errorMessage)
        })

        setLoading(false)
    }

    function submitPasswordUpdate(e) {
        e.preventDefault()

        // Set Messages
        setPasswordMessage("")
        setPasswordError("")

        // Check Input
        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
             return setPasswordError("Passwords do not match.")
        }

        // Update Password
        setLoading(true)
        
        updateUserPassword(passwordRef.current.value)
        .then((outcome) => {
            setPasswordMessage("Successfully set new Password.")
            console.log(outcome)
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            if (errorCode == "auth/weak-password") {
                setPasswordError("Password should be atleast 6 characters long.")
            } else if (errorCode =="auth/requires-recent-login") {
                setPasswordError("You must relogin before Updating your Password.")
            }  else {
                setPasswordError("Error.")
            }
            console.log(errorCode)
            console.log(errorMessage)
        })

        setLoading(false)
    }

    if (!User) { return }

    return (
        <main>
            <div className="BodySettings CenterDivColumn">
                <div className="HeaderMain">Settings</div>
                <div className="ContainerCentered">
                    <div className="HeaderMain">Username</div>
                    {username}
                    <input
                        type="text"
                        placeholder="New Username..."
                        className="Input"
                        ref={usernameRef}
                    />
                    <button onClick={submitUsernameUpdate} className="ButtonRounded ButtonGray ButtonBold ButtonTextLarge">Update Username</button>
                    {usernameMessage && 
                        <div className="ContainerSuccess">
                            {usernameMessage}
                        </div>
                    }
                    {usernameError && 
                        <div className="ContainerError">
                            {usernameError}
                        </div>
                    }
                </div>
                <div className="ContainerCentered">
                    <div className="HeaderMain">Email</div>
                    {User.email}
                    <input
                        type="email"
                        placeholder="New Email..."
                        className="Input"
                        ref={emailRef}
                    />
                    <input
                        type="email"
                        placeholder="Retype Email..."
                        className="Input"
                        ref={emailConfirmRef}
                    />
                    <button onClick={submitEmailUpdate} className="ButtonRounded ButtonGray ButtonBold ButtonTextLarge">Update Email</button>
                    {emailMessage && 
                        <div className="ContainerSuccess">
                            {emailMessage}
                        </div>
                    }
                    {emailError && 
                        <div className="ContainerError">
                            {emailError}
                        </div>
                    }
                </div>
                <div className="ContainerCentered">
                    <div className="HeaderMain">Password</div>
                    <input
                        type="password"
                        placeholder="New Password..."
                        className="Input"
                        ref={passwordRef}
                    />
                    <input
                        type="password"
                        placeholder="Retype Password..."
                        className="Input"
                        ref={passwordConfirmRef}
                    />
                    <button onClick={submitPasswordUpdate} className="ButtonRounded ButtonGray ButtonBold ButtonTextLarge">Update Password</button>
                    {passwordMessage && 
                        <div className="ContainerSuccess">
                            {passwordMessage}
                        </div>
                    }
                    {passwordError && 
                        <div className="ContainerError">
                            {passwordError}
                        </div>
                    }
                </div>
            </div>
        </main>
      )
}