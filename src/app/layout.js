"use client"

import Navbar from "./Navbar"
import { AuthProvider } from "./AuthContext"
import "./css/App.css"
import { useEffect } from "react";
import favicon from "../../public/favicon.ico"

export const metadata = {
  title: "Test App",
  description: 'app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
        <body>
          <AuthProvider>
            <Navbar/>
            <div className="MainHeaderOffset">
              {children}
            </div>
          </AuthProvider>
        </body>
    </html>
  )
}
