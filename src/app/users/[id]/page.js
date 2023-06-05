"use client"

import React, {useState, useEffect, useRef} from 'react'
import { useAuthContext } from '@/app/Authentication'
import formatDistanceToNow from "date-fns/formatDistanceToNow"
import "@/app/css/App.css"
import "@/app/css/Users.css"
import { useRouter } from 'next/navigation';
import { LoadingFrame } from '@/app/library/Library'
// Firestore
import {firestore} from "@/app/FirebaseSetup"
import {
  collection,
  addDoc, deleteDoc, doc, updateDoc, getDoc, getDocs, onSnapshot,
  query, where, orderBy, limit, startAfter,
  serverTimestamp 
} from "firebase/firestore"

export default function ProfilesPage({params}) {
  const {User} = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState([])
  const [inputText, setInputText] = useState("")
  const ProfilesFirestore = collection(firestore, "Profiles")
  const router = useRouter();

  const uid = params.id
  const PaginationSize = 10

  // Start
  useEffect(() => {
    // Create Posts
    createExampleDocuments()
    // Subscribe Profile
    getProfileFeed()
  }, [])

  function createExampleDocuments() {
    const UserDoc = doc(ProfilesFirestore, User.uid)
    const PostsCollection = collection(UserDoc, "Posts")
    for (let i = 0; i < 9; i++) {
      addDoc(PostsCollection, {
        uid: User.uid,
        Time: serverTimestamp(),
        Text: Math.random().toString(36).substring(2, 10),
      })
    }
    console.log("go")
  }

  const getProfileFeed = async () => {
    // Loading
    setLoading(true)
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
    // Loading
    setLoading(false)
  }

  function addItem(e) {
    e.preventDefault()
    if (loading) {return}
    // Check Fields
    let Input = inputText
    if (Input === "") {return}
    if (!/\S/.test(inputText)) {return} // Only Spaces
    // Clear Input Box
    setInputText("")
    // Save to Firestore
    setLoading(true)
    const UserDoc = doc(ProfilesFirestore, uid)
    const PostsCollection = collection(UserDoc, "Posts")
    addDoc(PostsCollection, {
      Text: Input,
      Time: serverTimestamp(),
    })
    .finally(() => {
      setLoading(false)
    })
  }

  const Post = ({info}) => {
    //console.log(info)
    const {Text, Time} = info
    // Get Time
    let timeFormatted = ""
    if (Time) {
        let date = new Date(Time.seconds * 1000)
        let timeFormattedClassic =  (date.getMonth() + 1) + "/" + (date.getDate())
        timeFormatted = formatDistanceToNow(date, {addSuffix: true})
    }
    // Post
    return (
      <div className="ContainerGeneric">
        <div className="CheckboxInformation">
        <div className="CheckboxLeftPane">
            <label className="CheckboxItemLabel">{Text}</label>
          </div>
          <div className="CheckboxRightPane">
          </div>
        </div>
        <div className="CheckboxTimeLabel">
          <label><i>{timeFormatted}</i></label>
        </div>
      </div>
    )
  }

  return (
    <main>
      <LoadingFrame loading={loading}/>
      <div className="BodyTasks">
        <div className="HeaderMain">{uid}'s' Profile</div>
        <div className="ContainerCentered">
          <textarea 
            placeholder="Type here..." 
            className="TextArea"
            onChange={(e) => setInputText(e.target.value)}
            value={inputText}
          />
          <button onClick={addItem} className="ButtonRounded ButtonBlue ButtonOutlineBlack ButtonBold ButtonTextLarge">Post Tweet</button>
        </div>
        <ul className="TasksList">
          {list && list.map((v) => {
            return <Post key={v.id} info={v}/>
          })}
        </ul>
      </div>
    </main>
  )
}
