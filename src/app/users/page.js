"use client"

import React, {useState, useEffect, useRef} from 'react'
import { useAuthContext } from '@/app/Authentication'
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const {User} = useAuthContext()
  const router = useRouter();

  // Start
  useEffect(() => {
    // Navigate to My Profile
    router.push("/users/" + User.uid)
  }, [])
}
