import React, {useContext, useState, useEffect} from 'react'
import {
    auth
} from "./FirebaseSetup"
import {
    signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail,
    onAuthStateChanged, updateEmail, updatePassword
} from "firebase/auth"
import {firestoreGetUsernameFromUID} from './library/FunctionsFirestore'
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { LoadingFrame } from './library/Library';

const AuthContext = React.createContext()

export function useAuthContext() {
    return useContext(AuthContext)
}

export function AuthProvider({children}) {
    const [User, setUser] = useState()
    const [username, setUsername] = useState("")
    const [loading, setLoading] = useState(true)
    const router = useRouter();
    const pathname = usePathname();

    // User Routes for User Paths
    let UserRoutes = [
        "/",
        "/chat",
        "/users",
        "/settings",
        "/tasks",
    ]
    useEffect(() => {
        // Auth Context will Render every time a Page is Loaded
        if (!User) {
            //if (UserRoutes.find(route => route == pathname)) {
                router.push('/login')
            //}
        }
    }, [User, pathname])

    // Auth Changed
    useEffect(() => {
        const updateUser = onAuthStateChanged(auth, (user) => {
            // Set User
            setUser(user)
            // Set Loading
            setLoading(false)
            // Get Username
            if (user) {
                getMyUsername(user)
            }
        })
        return updateUser
    }, [])

    // Get Username
    function getMyUsername(user) {
        firestoreGetUsernameFromUID(user.uid)
        .then(async (result) => {
            // Set Username
            if (result) {
                setUsername(result)
            }
        }).catch((error) => {
            console.log(error)
        })
    }

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
            // User Logged Out
            //router.push("/")
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
        setUsername,
        // Functions
        signup,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        updateUserEmail,
        updateUserPassword,
    }

    // Render Loading Frame if Auth State is not Known
    return (
        <AuthContext.Provider value={contextValues}>
            <LoadingFrame loading={loading}/>
            {!loading && children}
        </AuthContext.Provider>
    )
}