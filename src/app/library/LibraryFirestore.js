import {firestore} from "../FirebaseSetup"
import {getFunctions, httpsCallable} from "firebase/functions";
import {
    collection,
    addDoc, deleteDoc, doc, getDoc, getDocs, onSnapshot,
    query, where, orderBy, limit, startAfter,
    documentId,
    serverTimestamp,
} from "firebase/firestore"

import { RemoveDuplicates } from "./Library";

// Get Profiles from List of UIDs
export const getProfiles = async (uids) => {
    try {
        // Check Length
        if (uids.length <= 0) {return}
        // Remove Duplicates
        let SearchList = RemoveDuplicates(uids)
        if (SearchList.length > 30) { 
            console.log("Max Profiles Exceeded") 
            return 
        }
        // Get Docs
        const Query = query(
            collection(firestore, "UsersPublic"),
            where(documentId(), "in", SearchList)
        )
        const snapshot = await getDocs(Query)
        // Iterate Docs
        let List = []
        snapshot.docs.forEach((e) => {
            // Add Fetch
            List.push(e.data()) // console.log("Fetched profile " + e.data().Username)
        })
        // Return Docs
        return List
    } catch(error) {console.log(error)}
}

// Get Profile from UID
export const getProfile = async (uid) => {
    try {
        // Check Input
        if (!uid) {return}
        // Get Doc
        const docRef = doc(firestore, "UsersPublic", uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            // Return Doc
            return docSnap.data()
        }
    } catch(error) {console.log(error)}
}
















// Update Username
export const setFirestoreUsername = async (Input) => {
    return httpsCallable(getFunctions(), "SetUsername")({
        Username: Input
    })
    .catch((error) => {console.log(error)})
}

// Get Usernames Profiles
// export const FirestoreGetUserProfile = async (uid) => {
//     return httpsCallable(getFunctions(), "GetUserProfile")(uid)
//     .catch((error) => {
//         printError(error)
//     })
// }

// Get All Usernames Profiles
// export const FirestoreGetArrayUserProfiles = async (docs) => {
//     return httpsCallable(getFunctions(), "FirestoreGetArrayUserProfiles")(docs)
//     .catch((error) => {
//         printError(error)
//     })
// }












// Testing
export const checkAPIReady = async (Input) => {
    return httpsCallable(getFunctions(), "TestingAPILoaded")()
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
    .catch((error) => {error})
}