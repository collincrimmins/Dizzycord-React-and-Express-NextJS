import React, {useState, useEffect, useRef} from 'react'
import {useAuthContext} from "..//AuthContext"
import {firestore} from "../FirebaseSetup"
import "../css/Chat.css"
import {verifyTextInput, sleep} from '../functions/Functions'
// Firestore
import {
    collection,
    addDoc, deleteDoc, doc, updateDoc, getDoc, getDocs, onSnapshot,
    query, where, orderBy, limit, startAfter,
    serverTimestamp 
  } from "firebase/firestore"

export default function ChatInput() {
    const {User} = useAuthContext()
    const [loading, setLoading] = useState(false)
    const [inputText, setInputText] = useState("")
    const [errorClassText, setErrorClassText] = useState("")

    const submitMessage = async(forcedTestInput) => {
        // Check Input
        if (!verifyTextInput(inputText)) {
            setErrorClassText("ChatInputFormError")
            return
        }
        setErrorClassText("")
        // Clear Input Box
        let Input = inputText
        setInputText("")
        // Send Message
        const colRef = collection(firestore, "Chat")
        addDoc(colRef, {
            uid: User.uid,
            Time: serverTimestamp(),
            Text: forcedTestInput || Input,
        })
        .then(function(docRef) {
            //scrollToNewest()
        })
        .catch(function(error) {console.log(error)})
        
        // Get Username
        // let Nickname = ""
        // firestore.collection("Users").doc(User.uid).get()
        // .then((Result) => {})

        // const docSnap = await getDoc(doc);
        // if (docSnap.exists()) {
        //     Nickname = docSnap.data().Username
        // }
        // Send Message
        // chatFirestore
        // .add({
        //     uid: User.uid,
        //     time: firebase.firestore.FieldValue.serverTimestamp(),
        //     text: forcedTestInput || Input,
        //     nickname: Nickname
        // })
        // .then(function(docRef) {
        //     //scrollToNewest()
        // })
        // .catch(function(error) {
        //     //console.log("Error Adding: " + error)
        // })
    }

    const submitButton = async(e) => {
        e.preventDefault()
        if (inputText === "spam") {
            // Testing
            for (let i = 1; i <= 50; i++) {
                // Instant
                //submitMessage("Test... " + i.toString())
                // 1-at-atime
                //await sleep(150);
                await submitMessage("Test... " + i.toString())
            }
        } else {
            submitMessage()
        }
    }

    return (
        <form className="ChatFooterBox" onSubmit={submitButton} disabled={loading}>
            <input 
                type="text"
                className={"ChatInputForm " + errorClassText}
                placeholder="New Message..."
                onChange={(e) => setInputText(e.target.value)}
                value={inputText}
            />
            <button className="ChatInputSubmitButton">{">"}</button>
        </form>
    )
}
