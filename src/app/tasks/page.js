"use client"

import React, {useState, useEffect, useRef} from 'react'
import {useAuthContext} from "../AuthContext"
import {firestore} from "../FirebaseSetup"
import formatDistanceToNow from "date-fns/formatDistanceToNow"
//import {doc, getDoc, getDocs, updateDoc, deleteDoc} from "firebase/firestore"
import "../css/App.css"
import "../css/Tasks.css"
import {PulseLoader} from "react-spinners";
import { useRouter } from 'next/navigation';
// Firestore
import {
  collection,
  addDoc, deleteDoc, doc, updateDoc, getDoc, getDocs, onSnapshot,
  query, where, orderBy, limit, startAfter,
  serverTimestamp 
} from "firebase/firestore"

export default function TasksPage() {
  const {User} = useAuthContext()
  const [list, setList] = useState([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const ListsFirestore = collection(firestore, "Lists") // firestore.collection("Lists")
  const router = useRouter();

  // Start
  useEffect(() => {
    // Subscribe Tasks
    const unsubscribeTasks = startTasksSubscription()
    // End Listeners
    return () => {
      unsubscribeTasks()
    }
  }, [])

  const startTasksSubscription = () => {
    // Get Snapshot
    const UserDoc = doc(ListsFirestore, User.uid)
    const TasksCollection = collection(UserDoc, "Tasks")
    const Query = query(
      TasksCollection,
      orderBy("time", "desc"),
    )
    return onSnapshot(Query, async (snapshot) => {
      let List = []
      snapshot.docs.forEach((doc) => {
        let Item = {...doc.data(), id: doc.id}
        List.push(Item)
      })
      setList(List)
    })
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
    const UserDoc = doc(ListsFirestore, User.uid)
    const TasksCollection = collection(UserDoc, "Tasks")
    addDoc(TasksCollection, {
      item: Input,
      checked: false,
      time: serverTimestamp(),
    })
    .finally(() => {
      setLoading(false)
    })
  }

  const TaskItem = (v) => {
    const {item, checked, time, id} = v.values
    // Get Time
    let timeFormatted = ""
    if (time) {
        let date = new Date(time.seconds * 1000)
        let timeFormattedClassic =  (date.getMonth() + 1) + "/" + (date.getDate())
        timeFormatted = formatDistanceToNow(date, {addSuffix: true})
    }
    // Toggle Checkbox
    const toggleCheckItem = async () => {
      if (loading) {return}
      setLoading(true)
      // Check Document Exists
      const UserDoc = doc(ListsFirestore, User.uid)
      const TasksCollection = collection(UserDoc, "Tasks")
      const docRef = doc(TasksCollection, id)
      const docSnap = await getDoc(docRef)
      let previousChecked = false
      if (docSnap.exists()) {
        previousChecked = docSnap.data().checked
      } else {
        return setLoading(false)
      }
      // Update Document
      await updateDoc(docRef, {
        checked: !previousChecked
      })
      .finally(() => {
        setLoading(false)
      })
    }
    // Delete
    const deleteItem = async () => {
      if (loading) {return}
      setLoading(true)
      const UserDoc = doc(ListsFirestore, User.uid)
      const TasksCollection = collection(UserDoc, "Tasks")
      const docRef = doc(TasksCollection, id)
      await deleteDoc(docRef)
      .then(() => {
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
    }
    // Todo Item Box
    return (
      <div className="ContainerGeneric">
        <div className="CheckboxInformation">
          <div className="CheckboxLeftPane">
            <input type="checkbox" className="checkmark" checked={checked} onChange={()=>{}} onClick={toggleCheckItem}></input>
            <label className={checked ? "CheckboxItemLabelDashed " : "CheckboxItemLabel"}>{item}</label>
          </div>
          <div className="CheckboxRightPane">
            <button className="ButtonSquare ButtonRed ButtonOutlineBlack ButtonTextLarge" onClick={deleteItem}>X</button>
          </div>
        </div>
        <div className="CheckboxTimeLabel">
          <label><i>{timeFormatted}</i></label>
        </div>
      </div>
    )
  }

  const LoadingFrame = () => {
    if (loading) {
        return (
            <div className="LoadingFrame">
                <PulseLoader
                    color={"#ffffff"}
                    loading={loading}
                    radius={25}
                    height={45}
                    width={10}
                    margin={25}
                />
            </div>
        )
    }
}

  return (
    <main>
      <LoadingFrame/>
      <div className="BodyTasks">
        <div className="HeaderMain">My List</div>
        <div className="ContainerCentered">
          <textarea 
            placeholder="Type here..." 
            className="TextArea"
            onChange={(e) => setInputText(e.target.value)}
            value={inputText}
          />
          <button onClick={addItem} className="ButtonRounded ButtonNeonGreen ButtonOutlineBlack ButtonBold ButtonTextLarge">Add</button>
        </div>
        <ul className="TasksList">
          {list && list.map((v) => {
              return <TaskItem key={v.id} values={v}/>
          })}
        </ul>
      </div>
    </main>
  )
}
