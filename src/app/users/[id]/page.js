"use client"

import React, {useState, useEffect, useRef} from 'react'
import { useAuthContext } from '@/app/Authentication'
import formatDistanceToNow from "date-fns/formatDistanceToNow"
import "@/app/css/App.css"
import "@/app/css/Profiles.css"
import { useRouter } from 'next/navigation';
import { LoadingFrameFullScreen, LoadingFrameFill } from '@/app/library/Library'
import ProfileFeed from './feed'
// Firestore
import { getProfile } from '@/app/library/LibraryFirestore'

export default function ProfilesPage({params}) {
  const [loading, setLoading] = useState(false)
  const [profileInfo, setProfileInfo] = useState()
  
  const uid = params.id
  
  // Start
  useEffect(() => {
    // Loading
    setLoading(true)
    // Subscribe Profile
    getUserInfo()
    // Loading
    setLoading(false)
  }, [])

  // Get Profile from Database
  const getUserInfo = async () => {
    const profile = await getProfile(uid)
    if (profile) {
      setProfileInfo(profile)
    }
  }

  // Header
  function ProfileHeader() {
    // Check ProfileInfo & Loading
    if (loading || !profileInfo) {
      return (
        <div className="ProfileInfo">
          <LoadingFrameFill loading={true}/>
        </div>
      )
    }
    return (
      <div className="ProfileHeader">
        <div className="ProfileInfo">
          <img src={profileInfo.Photo} className="ProfilePhoto"/>
          <div className="ProfileUsername">{profileInfo.Username}</div>
        </div>
        <div className="ProfileBio">
          This is my bio...
        </div>
      </div>
    )
  }

  return (
    <main>
      <div className="BodyUsers">
        {/* Header */}
        <ProfileHeader/>
        {/* Feed */}
        <ProfileFeed uid={uid}/>
      </div>
    </main>
  )
}
