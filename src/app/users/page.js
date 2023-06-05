"use client"

import React, {useState, useEffect, useRef} from 'react'
import {useAuthContext} from "../Authentication"
import {firestore} from "../FirebaseSetup"
import formatDistanceToNow from "date-fns/formatDistanceToNow"
//import {doc, getDoc, getDocs, updateDoc, deleteDoc} from "firebase/firestore"
import "../css/App.css"
import "../css/Tasks.css"
import { useRouter } from 'next/navigation';
import { LoadingFrame } from '../library/Library'
// Firestore
import {
  collection,
  addDoc, deleteDoc, doc, updateDoc, getDoc, getDocs, onSnapshot,
  query, where, orderBy, limit, startAfter,
  serverTimestamp 
} from "firebase/firestore"

export default function UsersPage() {
  const {User} = useAuthContext()
  const [loading, setLoading] = useState(false)
  const UsersFirestore = collection(firestore, "Users")
  const router = useRouter();

  // Start
  useEffect(() => {
    
    // Subscribe Profile
    const unsubscribeProfile = startProfileSubscription()
    // End Listeners
    return () => {
     // unsubscribeProfile()
    }
  }, [])

  const startProfileSubscription = (UID) => {
    // Loading
    setLoading(true)
    // Get Snapshot
    // const UserDoc = doc(ListsFirestore, User.uid)
    // const TasksCollection = collection(UserDoc, "Tasks")
    // const Query = query(
    //   TasksCollection,
    //   orderBy("time", "desc"),
    // )
    // return onSnapshot(Query, async (snapshot) => {
    //   // Set List
    //   let List = []
    //   snapshot.docs.forEach((doc) => {
    //     let Item = {...doc.data(), id: doc.id}
    //     List.push(Item)
    //   })
    //   setList(List)
    //   // Loading
    //   setLoading(false)
    // })
  }

  return (
    <main>
      {/* <LoadingFrame loading={loading}/> */}
      <div className="">
        
      </div>
    </main>
  )
}
