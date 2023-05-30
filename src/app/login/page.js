"use client"

// React
import React, {useState, useEffect} from 'react'
// Contexts
import { useAuthContext } from '../AuthContext'
// Components
import LoginBox from "./LoginBox"
import SignupBox from './SignupBox'
import ResetBox from './ResetBox'

export default function Page() {
  const {User} = useAuthContext()
  const [boxInView, setBoxInView] = useState("LoginBox")
  //const navigate = useNavigate()

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
    //navigate("/")
  }

  // Check if Logged In
  useEffect(() => {
    if (User) {
      //console.log("User: " + User.email)
      navigateToHome()
      return navigateToHome()
    }
  }, [])

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
