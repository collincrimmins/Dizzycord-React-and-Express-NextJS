"use client"

import Chat from "./chat/Chat"
import { useAuthContext } from './AuthContext'
import { useRouter } from 'next/navigation';
import { useEffect } from "react";

export default function HomePage() {
  const {User} = useAuthContext()
  const router = useRouter();

  useEffect(() => {
    router.push('/chat')
  }, [])
}
