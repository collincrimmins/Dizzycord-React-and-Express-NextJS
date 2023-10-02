"use client"

import React, {useState, useEffect, useRef} from 'react'
import {useAuthContext} from "../Authentication"
import formatDistanceToNow from "date-fns/formatDistanceToNow"
import "../css/App.css"
import "../css/Quizzes.css"
import { useRouter } from 'next/navigation';
import { LoadingFrameFullScreen } from '../library/Library'
// Firestore
import {firestore} from "../FirebaseSetup"
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
  const QuizzesFirestore = collection(firestore, "Quizzes")
  const router = useRouter();

  let Quizzes = [
    "Personality Quiz",
    "Coding Quiz",
    "Forest Survival Quiz"
  ]

  // Start
  useEffect(() => {
    // Subscribe Tasks
    const unsubQuizzes = startQuizzesSubscription()
    // End Listeners
    return () => {
      unsubQuizzes()
    }
  }, [])

  useEffect(() => {
    console.log(list)
  }, [list])

  const startQuizzesSubscription = () => {
    // Loading
    setLoading(true)
    // Get Snapshot
    const UserDoc = doc(QuizzesFirestore, User.uid)
    const TasksCollection = collection(UserDoc, "Quizzes")
    const Query = query(
      TasksCollection,
      orderBy("time", "desc"),
    )
    return onSnapshot(Query, async (snapshot) => {
      // Set List
      let List = []
      snapshot.docs.forEach((doc) => {
        let Item = {...doc.data(), id: doc.id}
        List.push(Item)
      })
      setList(List)
      // Loading
      setLoading(false)
    })
  }

  const QuizTile = (values) => {
    const QuizTitle = values.title
    // Check Completed
    let CompletedQuiz = false
    Quizzes.forEach((p) => {
      list.forEach((q) => {
        if (p == q.QuizTitle) {
          if (q.Completed) {
            CompletedQuiz = true
            return
          }
        }
      })
      if (CompletedQuiz) {return}
    })
    // Button - Start
    function startQuiz() {

    }
    // Return
    return (
      <div className="ContainerGeneric">
        <div className="QuizFrame">
          <div className="QuizTitle">
            {QuizTitle}
          </div>
          <button onClick={startQuiz} className="ButtonRounded ButtonNeonGreen ButtonOutlineBlack ButtonTextLarge StartButtonQuiz">
            Start
          </button>
        </div>
        <div className="QuizFrameBottom">
          Not completed
        </div>
      </div>
    )
  }
  
  return (
    <main>
      <LoadingFrameFullScreen loading={loading}/>
      <div className="QuizzesBody">
        <div className="HeaderMain">Quizzes</div>
        <ul className="QuizzesList">
          {Quizzes.map((v) => {
            return <QuizTile key={v} title={v}/>
          })}
        </ul>
      </div>
    </main>
  )
}
