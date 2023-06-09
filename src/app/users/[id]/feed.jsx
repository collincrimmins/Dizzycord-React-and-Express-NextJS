"use client"

import React, {useState, useEffect, useRef} from 'react'
import { useAuthContext } from '@/app/Authentication'
import formatDistanceToNow from "date-fns/formatDistanceToNow"
import "@/app/css/App.css"
import "@/app/css/Profiles.css"
import { LoadingFrameFullScreen, LoadingFrameFill } from '@/app/library/Library'
// Firestore
import {firestore} from "@/app/FirebaseSetup"
import {
  collection,
  addDoc, deleteDoc, doc, updateDoc, getDoc, getDocs, onSnapshot,
  query, where, orderBy, limit, startAfter,
  serverTimestamp 
} from "firebase/firestore"
import { getProfiles } from '@/app/library/LibraryFirestore'
import { sleep } from '@/app/library/Library'
import { RemoveDuplicates } from '@/app/library/Library'

export default function ProfileFeed(info) {
  const {User} = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [inputText, setInputText] = useState("")
  const ProfilesFirestore = collection(firestore, "Profiles")

  const [list, setList] = useState([])
  const [userProfiles, setUserProfiles] = useState([])

  const PaginationSize = 15

  const uid = info.uid

  // Start
  useEffect(() => {
    // Loading
    setLoading(true)
    // Get Feed
    getProfileFeed()
    // Loading
    setLoading(false)
  }, [])

  // Update Profiles on New Feed
  useEffect(() => {
    // Check & Get new Profiles
    getProfilesForList()
  }, [list])

  // Apply Profiles to New Feed
  useEffect(() => {
    // Update List with New Profiles
    updateListWithProfiles()
  }, [userProfiles])

  // Fill List w/ Profiles
  const getProfilesForList = async () => {
    // Check Length
    if (list.length <= 0) {return}
    // Apply Existing Profiles to List
    updateListWithProfiles()
    // Check for Missing Profiles in List
    let newIdList = []
    list.forEach((e) => {
      // Check if Profile Applied
      if (!e.Username) {
        // Check if User Profile already Fetched
        const ProfileAlreadyExists = userProfiles.find((q) => {
          if (q.uid === e.uid) {
            return true
          }
        })
        // Add to Requested List
        if (!ProfileAlreadyExists) {
          newIdList.push(e.uid)
        }
      }
    })
    let newRequestedIds = RemoveDuplicates(newIdList)
    // Get Profiles from List
    if (newRequestedIds.length <= 0) {return}
    const profiles = await getProfiles(newRequestedIds)
    // Add New & Old to List
    if (profiles) {
      let NewList = [...userProfiles, ...profiles]
      setUserProfiles(NewList)
    }
  }

  const updateListWithProfiles = () => {
    // Use "userProfiles" to update List
    let NewList = [...list]
    let Updated = false
    NewList.forEach((e) => {
      // Check if Username Exists
      if (!e.Username) {
        // Get Profile from UserProfiles
        let profile = userProfiles.find((q) => e.uid === q.uid)
        // Set Profile
        if (profile) {
          // Push Update
          Updated = true
          // Add Profile
          e.Username = profile.Username
          e.Photo = profile.Photo
        }
      }
    })
    // Set List
    if (Updated) {
      setList(NewList)
    }
  }

  // Write Post
  function addNewPost(e) {
    e.preventDefault()
    //if (loading) {return}
    // Check Fields
    let Input = inputText
    if (Input === "") {return}
    if (!/\S/.test(inputText)) {return} // Only Spaces
    // Clear Input Box
    setInputText("")
    // Save to Firestore
    //setLoading(true)
    const UserDoc = doc(ProfilesFirestore, uid)
    const PostsCollection = collection(UserDoc, "Posts")
    addDoc(PostsCollection, {
      Text: Input,
      Time: serverTimestamp(),
      uid: User.uid,
    })
    .finally(() => {
      // Loading
      //setLoading(false)
      // Refresh Feed
      getProfileFeed()
    })
  }

  // Get Feed
  const getProfileFeed = async () => {
    // Get Snapshot
    const UserDoc = doc(ProfilesFirestore, uid)
    const PostsCollection = collection(UserDoc, "Posts")
    const Query = query(
      PostsCollection,
      orderBy("Time", "desc"),
      limit(PaginationSize)
    )
    const snapshot = await getDocs(Query)
    // Set List
    let List = []
    snapshot.docs.forEach((doc) => {
      let Item = {...doc.data(), id: doc.id}
      List.push(Item)
    })
    setList(List)
  }

  // Post
  const Post = ({info}) => {
    const {Text, Time, Username, Photo} = info
    // Get Time
    let timeFormatted = ""
    if (Time) {
        let date = new Date(Time.seconds * 1000)
        let timeFormattedClassic =  (date.getMonth() + 1) + "/" + (date.getDate())
        timeFormatted = formatDistanceToNow(date, {addSuffix: true})
    }
    // Post
    return (
      <div className="PostContainer">
        {/* Top */}
        <div className="PostTop">
          <img src={Photo} className="ProfilePhoto"/>
          <div className="PostNameHeader">
            {Username}
          </div>
        </div>
        {/* Bottom */}
        <div className="PostBottom">
          <div className="">
          <div className="">
              <label className="">{Text}</label>
            </div>
            <div className="CheckboxRightPane">
            </div>
          </div>
          <div className="CheckboxTimeLabel">
            <label><i>{timeFormatted}</i></label>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
     {/* Write Post */}
      <div className="SubmitPostContainer">
          <textarea 
          placeholder="Type here..." 
          className="TextArea"
          onChange={(e) => setInputText(e.target.value)}
          value={inputText}
          />
          <button onClick={addNewPost} className="ButtonRounded ButtonBlue ButtonOutlineBlack ButtonBold ButtonTextLarge">Post Tweet</button>
      </div>
      {/* Feed */}
      <ul className="PostsList">
          {loading 
              ? (
                  <div className="FeedLoadingFrame">
                      <LoadingFrameFill loading={loading}/>
                  </div>
              )
              : (list && list.map((v) => {
              return <Post key={v.id} info={v}/>
              })
          )}
      </ul>
    </>
  )
}
