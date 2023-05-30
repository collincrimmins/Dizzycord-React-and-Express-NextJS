"use client"

import DizzycordIcon from "./images/Dizzycord.png"
import Chat from "./chat/Chat"
import { useAuthContext } from './AuthContext'
import { useRouter } from 'next/navigation';

export default function Page() {
  const {User} = useAuthContext()
  const router = useRouter();

  if (!User) {
    router.push('/login')
  }

  if (!User) { return }

  return (
    <main>
      <Chat/>
    </main>
  )
}
