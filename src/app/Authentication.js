import React, {useContext, useState, useEffect} from 'react'
import {
    auth
} from "./FirebaseSetup"
import {
    signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail,
    onAuthStateChanged, updateEmail, updatePassword
} from "firebase/auth"
import {getProfile, checkAPIReady} from './library/LibraryFirestore'
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { LoadingFrameFullScreen } from './library/Library';
import { sleep } from './library/Library';

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

    // Login Automatically for Testing
    useEffect(() => {
        async function createUser() {
            // Yield for APIs Ready
            let APIsLoaded = false
            while (APIsLoaded === false) {
                try {
                    const Ready = await checkAPIReady()
                    if (Ready.data === true) { 
                        APIsLoaded = true
                    }
                } catch {}
                await sleep(500);
            }
            // Create Account
            let TestingCreatedAccount = sessionStorage.getItem("TestingCreatedAccount")
            if (User) {return}
            if (TestingCreatedAccount) {return}
            if (process.env.NEXT_PUBLIC_DEV === "true") {
                sessionStorage.setItem("TestingCreatedAccount", true)
                let email = "test@test.com"
                let password = "123456"
                signup(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    sleep(500)
                    router.push("/")
                })
                .finally(() => {
                    setLoading(false)
                })
            }
        }
        createUser()
    }, [])

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
        getProfile(user.uid)
        .then(async (result) => {
            // Set Username
            if (result) {
                setUsername(result.Username)
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    // Sign Up
    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password) 
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
    async function logout() {
        try {
            await signOut(auth);
        } catch (error) {console.log(error)}
    }
    
    // Reset Password
    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email)
    }

    // Update Email
    function updateUserEmail(email) {
        return updateEmail(User, email)
    }

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
            <LoadingFrameFullScreen loading={loading}/>
            {!loading && children}
        </AuthContext.Provider>
    )
}