"use client"

import {useAuthContext} from "../AuthContext"
import { useRouter } from 'next/navigation';

export default function LoginLayout({children}) {
  const {User} = useAuthContext()
  const router = useRouter();

  if (!User) {
    router.push('/login')
  }

    return (
      <section>
        {children}
      </section>
    );
  }