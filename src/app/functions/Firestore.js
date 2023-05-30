import {firestore} from "../FirebaseSetup"
import {getFunctions, httpsCallable} from "firebase/functions";
import {
    collection,
    addDoc, deleteDoc, doc, getDoc, getDocs, onSnapshot,
    query, where, orderBy, limit, startAfter,
    serverTimestamp 
} from "firebase/firestore"

// Update Username
export const setFirestoreUsername = async (Input) => {
    return httpsCallable(getFunctions(), "SetUsername")({
        Username: Input
    })
    .catch((error) => {
        printError(error)
    })
}

// Get Usernames Profiles
export const FirestoreGetAllUsers = async (docs) => {
    return httpsCallable(getFunctions(), "FirestoreGetAllUsers")(docs)
    .catch((error) => {
        printError(error)
    })
}

// Get Username from UID
export const getUsernameFromUID = async (uid) => {
    const document = doc(firestore, "Users", uid);
    const docSnap = await getDoc(document);
    if (docSnap.exists()) {
        return docSnap.data().Username
    } else {
        return ""
    }
}

// Random Number
export const RandomNumber = async () => {
    httpsCallable(getFunctions(), "RandomNumber")({
        myname: "hello",
    })
    .then((result) => {
        // Result
        const Data = result.data;
        console.log(Data)
    })
    .catch((error) => {printError(error)})
}

export const getPictureFromUID = async (uid) => {
    const document = doc(firestore, "Users", uid);
    const docSnap = await getDoc(document);
    if (docSnap.exists()) {
        return docSnap.data().picture
    } else {
        return ""
    }
}

export const apicalltest = () => {
    const httpscall = httpsCallable(getFunctions(), "testAPI");
    httpscall({
        field1: "hello",
    })
    .then((result) => {
        // Result
        const data = result.data;
        console.log("Api Test Result:")
        console.log(data)
    })
    .catch((error) => {
        // Error
        const code = error.code;
        const message = error.message;
        const details = error.details;
        console.log("API Error")
        console.log(code + " (" + message + ")")
        console.log(details)
    })
}

// Errors

const printError = (error) => {
    console.warn("API Error:")
    console.warn(error.code + " (" + error.message + ")")
    console.warn(error.details)
}