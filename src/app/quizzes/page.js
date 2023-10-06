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
  const [quizInView, setQuizInView] = useState("")
  const [list, setList] = useState([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const QuizzesFirestore = collection(firestore, "Quizzes")
  const router = useRouter();

  const [Quizzes, setQuizzes] = useState([
    {
      Title: "Personality Quiz", 
      Completed: false,
      Questions: [
        {
          Text: "What is 2+2?",
          MyAnswer:"",
          Answers: [
            {Text: "2", Correct: false},
            {Text: "4", Correct: true},
            {Text: "6", Correct: false},
            {Text: "8", Correct: false},
          ],
        },
      ]
    },
  ])

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
    //console.log(list)
  }, [list])

  // Get User's Quiz History
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

  // Quiz Card
  const QuizCard = (args) => {
    const {Title, Completed, Questions} = args.args
    //console.log(args)
    // Check Completed
    let CompletedQuiz = false
    Quizzes.forEach((p) => {
      list.forEach((q) => {
        if (p == q.Title) {
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
      setQuizInView(Title)
    }
    // Return
    return (
      <div className="ContainerGeneric">
        <div className="QuizFrame">
          <div className="QuizTitle">
            {Title}
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

  // View Quiz
  const QuizPage = (args) => {
    const {Title, Completed, Questions} = args.args
    // Submit Button
    function SubmitButton() {

    }
    // Return
    return (
      <div className="CenterList">
        {/* Title */}
        <div className="HeaderMain Center">
          {quizInView}
        </div>
        {/* Questions */}
        <div>
          {Questions.map((v) => {
            return <QuestionTile key={v} args={v}/>
          })}
        </div>
        {/* Submit Button */}
        <button onClick={SubmitButton} className="ButtonRounded ButtonNeonGreen ButtonOutlineBlack ButtonTextLarge StartButtonQuiz">
          Submit
        </button>
      </div>
    )
  }

  // Question Tile
  const QuestionTile = (args) => {
    const {Text, MyAnswer, Answers} = args.args
    // Answer Button
    const AnswerButton = (args) => {
      const AnswerText = args.args.Text
      let SelectedButton = false
      if (MyAnswer == AnswerText) {
        SelectedButton = true
      }
      // Clicked
      function ButtonClick() {
        setQuizzes((prev) => {
          let Quizzes = [...prev]
          Quizzes.forEach((v) => {
            // Find This Quiz
            if (v.Title == quizInView) {
              // Find This Quiz Question
              v.Questions.forEach((p) => {
                p.MyAnswer = AnswerText
              })
            }
          })
          return Quizzes
        })
      }
      // Return
      return (
        <div className="AnswerButton">
          {SelectedButton && 
            <button onClick={ButtonClick} className="ButtonRounded ButtonBlack ButtonOutlineBlack ButtonTextLarge StartButtonQuiz">
              {AnswerText}
            </button>
          }
          {!SelectedButton &&
            <button onClick={ButtonClick} className="ButtonRounded ButtonGray ButtonOutlineBlack ButtonTextLarge StartButtonQuiz">
              {AnswerText}
            </button>
          }
        </div>
      )
    }
    // Return
    return (
      <div className="ContainerGeneric">
        <div className="CenterQuestionFrame">
          {/* Question */}
          <div className="QuestionHeader">
            {Text}
          </div>
          {/* Answers */}
          {Answers.map((v) => {
            return <AnswerButton key={v.Text} args={v}/>
          })}
        </div>
      </div>
    )
  }
  
  return (
    <main>
      <LoadingFrameFullScreen loading={loading}/>
      <div className="List">
        {/* Quiz Page */}
        {quizInView !== "" &&
          Quizzes.map((v) => {
            if (v.Title === quizInView) {
              return <QuizPage key={v} args={v}/>
            }
          })
        }
        {/* List of Quizzes */}
        {quizInView === "" && 
          <div className="CenterList">
            <div className="HeaderMain Center">
              Quizzes
            </div>
            <ul>
              {Quizzes.map((v) => {
                return <QuizCard key={v} args={v}/>
              })}
            </ul>
          </div>
        }
      </div>
    </main>
  )
}
