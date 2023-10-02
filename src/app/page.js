"use client"

import { useRouter } from 'next/navigation';
import { useEffect } from "react";
import { useAuthContext } from './Authentication';

export default function HomePage() {
  const {User} = useAuthContext()
  const router = useRouter();

  useEffect(() => {
    // Default Page
    router.push("/quizzes")
  }, [])
}
