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
  const [writePostLoading, setWritePostLoading] = useState(false)
  const [inputText, setInputText] = useState("")
  const ProfilesFirestore = collection(firestore, "Profiles")

  const [list, setList] = useState([])
  const [userProfiles, setUserProfiles] = useState([])
  const [listCursor, setListCursor] = useState(null)
  const [listCursorEnd, setListCursorEnd] = useState(false)

  const PaginationSize = 5

  const profileuid = info.uid

  // Start
  useEffect(() => {
    async function startPage() {
      // Loading
      setLoading(true)
      // Get Feed
      await getNextProfileFeed()
      // Loading
      setLoading(false)
    }
    startPage()
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

  // Request New Profiles on any new List updates
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

  // Add Profiles to List
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

  // Create Standard Format for Documents
  const createStandardDoc = (doc) => {
    return {...doc.data(), id: doc.id}
  }

  // Get Feed
  const getNextProfileFeed = async () => {
    // Get Snapshot
    const UserDoc = doc(ProfilesFirestore, profileuid)
    const PostsCollection = collection(UserDoc, "Posts")
    let Query
    if (list.length == 0) {
      Query = query(
        PostsCollection,
        orderBy("Time", "desc"),
        limit(PaginationSize)
      )
    } else {
      Query = query(
        PostsCollection,
        orderBy("Time", "desc"),
        startAfter(listCursor),
        limit(PaginationSize)
      )
    }
    const snapshot = await getDocs(Query)
    // Create List
    let List = []
    snapshot.docs.forEach((doc) => {
      let Item = createStandardDoc(doc)
      List.push(Item)
    })
    // Set List
    let NewList = [...list, ...List]
    setList(NewList)
    // Set Cursor to Last Document from Firestore
    if (snapshot.docs.length > 0) {
      setListCursor(snapshot.docs[snapshot.docs.length - 1])
    } else {
      setListCursorEnd(true)
    }
  }

  // Add Newly Added Post to Feed
  const getJustAddedPost = async (docRef) => {
    try {
      // Get Just Written Post
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        // Set List
        let Item = createStandardDoc(docSnap)
        let NewList = [Item, ...list]
        setList(NewList)
      }
    } catch(error) {console.log(error)}
    // Loading
    setWritePostLoading(false)
  }

  // Load More Button
  const LoadMoreButton = () => {
    if (loading) {return}
    return (
        <button onClick={getNextProfileFeed} className="ButtonRounded ButtonLightBlue">Load More...</button>
    )
  }

  // End of History Frame
  const EndOfHistoryLabel = () => {
      return (
          <div className="ContainerGray">End of Message History</div>
      )
  }

  // Write Post
  function addNewPost(e) {
    e.preventDefault()
    if (writePostLoading) {return}
    // Check Fields
    let Input = inputText
    if (Input === "") {return}
    if (!/\S/.test(inputText)) {return} // Only Spaces
    // Clear Input Box
    setInputText("")
    // Save to Firestore
    setWritePostLoading(true)
    const UserDoc = doc(ProfilesFirestore, profileuid)
    const PostsCollection = collection(UserDoc, "Posts")
    addDoc(PostsCollection, {
      Text: Input,
      Time: serverTimestamp(),
      uid: User.uid,
    })
    .then((docRef) => {
      // Get Doc to Add to Feed
      getJustAddedPost(docRef)
    })
  }

  // Post
  const Post = ({info}) => {
    const {Text, Time, Username, Photo} = info
    // Placeholder Profile
    if (!Username) {
      
    }
    // Get Time
    let timeFormatted = ""
    let timeFormatted2 = ""
    if (Time) {
        let date = new Date(Time.seconds * 1000)
        let timeFormattedClassic =  (date.getMonth() + 1) + "/" + (date.getDate())
        timeFormatted = formatDistanceToNow(date, {addSuffix: true})
        timeFormatted2 = "(" + timeFormattedClassic + ")"
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
            <label><i>{timeFormatted} {timeFormatted2}</i></label>
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
          {/* Load More */}
          {((list.length >= PaginationSize) && (listCursorEnd !== true)) 
          ? <LoadMoreButton/> : <></>}
          {(listCursorEnd === true) ? 
          <EndOfHistoryLabel/> : <></>}
      </ul>
    </>
  )
}
