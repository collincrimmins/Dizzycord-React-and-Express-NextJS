import React, {useContext, useState, useEffect} from 'react'
import {
    auth
} from "./FirebaseSetup"
import {
    signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail,
    onAuthStateChanged, updateEmail, updatePassword
} from "firebase/auth"
//import "firebase/compat/auth"
import {getUsernameFromUID} from './functions/Firestore'

const AuthContext = React.createContext()

export function useAuthContext() {
    return useContext(AuthContext)
}

export function AuthProvider({children}) {
    const [User, setUser] = useState()
    const [username, setUsername] = useState("")
    const [loading, setLoading] = useState(true)
    //const navigate = useNavigate()

    // Auth Changed
    useEffect(() => {
        const updateUser = onAuthStateChanged(auth, (user) => {
            setUser(user)
            setLoading(false)
            if (user) {
                //console.log("Logged in: " + user.email)
            } else {
                //console.log("No login credentials")
            }
        })
        return updateUser
    }, [])

    // Initialization - Get Username
    useEffect(() => {
        if (!User) {return}
        getUsernameFromUID(User.uid)
        .then(async (result) => {
            // Set Username
            if (result) {
                setUsername(result)
            }
        }).catch((error) => {
            console.log(error)
        })
    }, [])

    // Sign Up
    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password) // return auth.createUserWithEmailAndPassword(email, password)
    }

    // Login
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    // Login with Google
    function loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        return signInWithPopup(auth, provider);
    }

    // Logout
    function logout() {
        return signOut(auth) // return auth.signOut()
        .then(() => {
           // navigate("/")
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            //console.log(errorCode)
            //console.log(errorMessage)
        })
    }
    
    // Reset Password
    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email)
    }

    // Update Email
    function updateUserEmail(email) {
        return updateEmail(User, email)
    }

    // Update Username
    /*function updateUsername(username) {
        return User.updateProfile({
            displayName: username,
        })
    }*/

    // Update Password
    function updateUserPassword(password) {
        return updatePassword(User, password)
    }

    const contextValues = {
        // User
        User,
        username,
        // Functions
        signup,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        updateUserEmail,
        updateUserPassword,
    }

    return (
        <>
            <AuthContext.Provider value={contextValues}>
                {!loading && children}
            </AuthContext.Provider>
        </>
    )
}