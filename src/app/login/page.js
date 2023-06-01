"use client"

// React
import React, {useState, useEffect} from 'react'
// Contexts
import { useAuthContext } from '../AuthContext'
import { useRouter } from 'next/navigation';
// Components
import LoginBox from "./LoginBox"
import SignupBox from './SignupBox'
import ResetBox from './ResetBox'

export default function LoginPage() {
  const {User} = useAuthContext()
  const [boxInView, setBoxInView] = useState("LoginBox")
  const router = useRouter();

  // Check if Logged In
  useEffect(() => {
    if (User) {
      //console.log("User: " + User.email)
      navigateToHome()
      return navigateToHome()
    }
  }, [])

  function viewSignup() {
    setBoxInView("SignupBox")
  }

  function viewLogin() {
    setBoxInView("LoginBox")
  }

  function viewResetPassword() {
    setBoxInView("ResetBox")
  }

  function navigateToHome() {
    router.push('/')
  }

  // Login & Signup
  if (User) {return}
  
  return (
    <main>
        {(boxInView == "LoginBox") &&
          <div>
            <LoginBox viewSignup={viewSignup} viewResetPassword={viewResetPassword}/>
          </div>
        }
        {(boxInView == "SignupBox") && 
          <div>
            <SignupBox viewLogin={viewLogin}/>
          </div>
        }
        {(boxInView == "ResetBox") && 
          <div>
            <ResetBox viewLogin={viewLogin}/>
          </div>
        }
    </main>
  )
}
