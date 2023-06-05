"use client"

import Chat from "./Chat"
import { useAuthContext } from '../Authentication'
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const {User} = useAuthContext()
  const router = useRouter();

  return (
    <main>
      <Chat/>
    </main>
  )
}
