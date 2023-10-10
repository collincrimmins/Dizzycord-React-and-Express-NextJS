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

export default function QuizzesPage() {
  const {User} = useAuthContext()
  const [quizInView, setQuizInView] = useState("")
  const [quizPageSubmitted, setQuizPageSubmitted] = useState(false)
  const [list, setList] = useState([])
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
        {
          Text: "What color is the Sky?",
          MyAnswer:"",
          Answers: [
            {Text: "Blue", Correct: true},
            {Text: "Red", Correct: false},
            {Text: "Green", Correct: false},
            {Text: "Black", Correct: false},
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

  // Quiz Frame
  const QuizCard = (args) => {
    const {Title, Completed, Questions} = args.args
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
          ...
        </div>
      </div>
    )
  }

  // Quiz Page
  const QuizPage = (args) => {
    const {Title, Completed, Questions} = args.args
    // Submit Quiz Button
    function SubmitButton() {
      if (!quizPageSubmitted) {
        setQuizPageSubmitted(true)
      }
    }
    // Exit Quiz Button
    function ExitButton() {
      // Clear MyAnswer's
      Questions.forEach((v) => {
        v.MyAnswer = ""
      })
      // Reset to Quiz List
      setQuizInView("")
      setQuizPageSubmitted(false)
    }
    // Get Quiz Results
    function GetQuizResult() {
      let TotalNumberQuestions = 0
      let TotalScore = 0
      Questions.forEach((v) => {
        // Add to Total Questions
        TotalNumberQuestions = TotalNumberQuestions + 1
        // Check Answers for Correct
        v.Answers.forEach((p) => {
          if (p.Correct) {
            if (v.MyAnswer == p.Text) {
              TotalScore = TotalScore + 1
            }
          }
        })
      })
      let Percentage = (TotalScore / TotalNumberQuestions) * 100
      return Percentage + "% (" + TotalScore + "/" + TotalNumberQuestions + ")"
    }
    // Return
    return (
      <div className="CenterList">
        {/* Title */}
        <div className="HeaderMain Center">
          {quizInView}
        </div>
        {/* Questions */}
        <div className="QuestionsList">
          {Questions.map((v) => {
            return <QuestionFrame key={v.Text} args={v}/>
          })}
        </div>
        {/* Results */}
        {quizPageSubmitted && 
          <div className="ContainerGeneric Center QuizTitle">
            <div>
              Results
            </div>
            <div>
              {GetQuizResult()}
            </div>
          </div>
        }
        {/* Submit Button */}
        {!quizPageSubmitted &&
          <button onClick={SubmitButton} className="ButtonRounded ButtonNeonGreen ButtonOutlineBlack ButtonTextLarge StartButtonQuiz">
            Submit
          </button>
        }
        {/* Exit Button */}
        {quizPageSubmitted &&
          <button onClick={ExitButton} className="ButtonRounded ButtonGray ButtonOutlineBlack ButtonTextLarge StartButtonQuiz">
            Close
          </button>
        }
      </div>
    )
  }

  // Question Frame
  const QuestionFrame = (args) => {
    const {Text, MyAnswer, Answers} = args.args
    // Select Answer Button
    const AnswerButton = (args) => {
      const AnswerText = args.args.Text
      const ThisAnswerIsCorect = args.args.Correct
      let SelectedButton = false
      if (MyAnswer == AnswerText) {
        SelectedButton = true
      }
      // Clicked Answer Button
      function ButtonClick() {
        // Check if Quiz Submitted
        if (quizPageSubmitted) {return}
        // Set MyAnswer
        setQuizzes((prev) => {
          let Quizzes = [...prev]
          Quizzes.forEach((v) => {
            // Find This Quiz
            if (v.Title == quizInView) {
              // Find This Quiz Question
              v.Questions.forEach((p) => {
                // Find this Answer
                p.Answers.forEach((q) => {
                  // Set MyAnswer to this Answer's Text
                  if (q.Text == AnswerText) {
                    p.MyAnswer = AnswerText
                  }
                })
              })
            }
          })
          return Quizzes
        })
      }
      // Return
      let MyAnswerWasCorrect
      if (MyAnswer == AnswerText) {
        if (ThisAnswerIsCorect) {
          MyAnswerWasCorrect = true
        }
      }
      // Quiz is Submitted
      if (quizPageSubmitted) {
        if (ThisAnswerIsCorect) {
          // Make Correct Answer Green
          return (
            <div className="AnswerButton">
              <button onClick={ButtonClick} className="QuestionAnsweredCorrect ButtonRounded ButtonTextLarge">
                {AnswerText}
              </button>
            </div>
          )
        }
        if (!MyAnswerWasCorrect) {
          if (MyAnswer == AnswerText) {
            // This was my Selection - Make Red
            return (
              <div className="AnswerButton">
                <button onClick={ButtonClick} className="QuestionAnsweredWrong ButtonRounded ButtonTextLarge">
                  {AnswerText}
                </button>
              </div>
            )
          } else {
            // Unselected - Leave Gray
            return (
              <div className="AnswerButton">
                <button onClick={ButtonClick} className="ButtonOutlineBlack ButtonRounded ButtonTextLarge">
                  {AnswerText}
                </button>
              </div>
            )
          }
        }
        return (
          <div className="AnswerButton">
            {MyAnswerWasCorrect ?
              <button onClick={ButtonClick} className="QuestionAnsweredWrong ButtonRounded ButtonTextLarge">
                {AnswerText} wrong
              </button>
            :
              <button onClick={ButtonClick} className="QuestionAnsweredCorrect ButtonRounded ButtonTextLarge">
                {AnswerText}
              </button>
            }
            
          </div>
        )
      }
      // Quiz is not Submitted
      return (
        <div className="AnswerButton">
          {SelectedButton && 
            <button onClick={ButtonClick} className="ButtonOutlineBlack ButtonOutlineBlack ButtonRounded ButtonLightBlue ButtonTextLarge">
              {AnswerText}
            </button>
          }
          {!SelectedButton &&
            <button onClick={ButtonClick} className="ButtonRounded ButtonOutlineBlack ButtonGray ButtonTextLarge StartButtonQuiz">
              {AnswerText}
            </button>
          }
        </div>
      )
    }
    // Check if Question Answer is Correct
    function checkIfCorrect() {
      let AnsweredCorrect
      Answers.forEach((v) => {
        if (AnsweredCorrect) {return}
        if (v.Correct) {
          if (MyAnswer == v.Text) {
            AnsweredCorrect = true
          }
        }
      })
      return AnsweredCorrect
    }
    let ContainerModifier = ""
    if (quizPageSubmitted) {
      if (checkIfCorrect()) {
        //ContainerModifier = ""
      } else {
        //ContainerModifier = "QuestionWrong"
      }
    }
    // Return
    return (
      <div className={`ContainerGeneric ${ContainerModifier}`}>
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
              return <QuizPage key={v.Title} args={v}/>
            }
          })
        }
        {/* Quizzes List */}
        {quizInView === "" && 
          <div className="CenterList">
            <div className="HeaderMain Center">
              Quizzes
            </div>
            <ul>
              {Quizzes.map((v) => {
                return <QuizCard key={v.Title} args={v}/>
              })}
            </ul>
          </div>
        }
      </div>
    </main>
  )
}
