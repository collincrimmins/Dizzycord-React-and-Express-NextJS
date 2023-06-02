import React, {useState, useEffect, useRef} from 'react'
import { useAuthContext } from '../AuthContext'
import formatDistanceToNow from "date-fns/formatDistanceToNow"
import { getUsernameFromUID } from '../functions/FunctionsFirestore'
import {firestore} from "../FirebaseSetup"
import "../css/Chat.css"
import {FirestoreGetArrayUserProfiles} from '../functions/FunctionsFirestore'
import Image from 'next/image';
import { LoadingFrame } from '../functions/Library'
// Firestore
import {
    collection,
    addDoc, deleteDoc, doc, updateDoc, getDoc, getDocs, onSnapshot,
    query, where, orderBy, limit, startAfter,
    serverTimestamp 
  } from "firebase/firestore"

import ChatInput from './ChatInput'

const PaginationSize = 15

export default function Chat() {
    const {User} = useAuthContext()
    const [messages, setMessages] = useState([])
    const [messagesCursor, setMessagesCursor] = useState(null)
    const [userProfiles, setUserProfiles] = useState([
        //{uid: "g37ZzS5dEZPBSmzyHbUA7zs8OIWH", Username: "Test"}
    ])
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef()

    // Initialization
    useEffect(() => {
        // Subscribe Messages
        const unsubscribeChatListener = getMessagesSubscription()
        // Scroll to Newest
        scrollToNewest()
        // End Listeners
        return () => {
            unsubscribeChatListener()
        }
    }, [])

    // Messages Update
    useEffect(() => {
        // (Instant) Update Messages on New Snapshot Update & History Update
        updateMessagesWithProfiles()
        // (Async) Check if New Profiles Needed
        runAsyncProfilesGetAll()
    }, [messages])

    // UserProfiles Update
    useEffect(() => {
        // (Instant) Update Messages on Profiles Update
        updateMessagesWithProfiles()
    }, [userProfiles])

    // Update Messages with User Profiles
    const updateMessagesWithProfiles = () => {
        // Update Messages with User Profiles
        setMessages((prevMessages) => {
            let newMessages = [...prevMessages]
            let updatedMessages = false
            newMessages.forEach((v) => {
                let Profile = userProfiles.find((p) => v.uid === p.uid)
                if (Profile) {
                    if (v.Username === null || v.Username !== Profile.Username || v.Photo !== Profile.Photo) {
                        updatedMessages = true
                        v.Username = Profile.Username
                        v.Photo = Profile.Photo
                    }
                }
            })
            if (!updatedMessages) {
                // Do not Trigger Update if Messages unchanged (infinite loop)
                return prevMessages
            } else {
                // Update Messages
                return newMessages
            }
        })
    }

    // Request Update of User Profiles (Error: Error Handling of Non-Existant User Lookups)
    const runAsyncProfilesGetAll = async () => {
        // Check if New Profiles Needed
        let newUserIds = []
        messages.forEach((v) => {
            if (!v.Username) {
                // Check if Added to Queue
                if (!newUserIds.find((e) => e === v.uid)) {
                    // Check if Profile needs to be Requested
                    if (!userProfiles.find((e) => e.uid === v.uid)) {
                        newUserIds.push(v.uid)
                    }
                }
            }
        })
        // Check if API Call Required
        if (newUserIds.length > 0) {
            // Get User Profiles from API
            const profileDocs = await FirestoreGetArrayUserProfiles(newUserIds)
            // Apply to User Profiles
            setUserProfiles((prevUserProfiles) => {
                let newProfiles = [...prevUserProfiles]
                // Add New Docs to Profiles
                profileDocs.data.forEach((doc) => {
                    const existingProfile = newProfiles.find((p) =>  p.uid === doc.uid)
                    if (!existingProfile) {
                        // Add New Profile
                        newProfiles.push(doc)
                    }
                })
                return newProfiles
            })
        }
    }

    // Messages Subscription (Error: Instant spam-add of 50+ messages will hit 10 Snapshot Limit)
    const getMessagesSubscription = () => {
        // Loading
        setLoading(true)
        // Get Snapshot
        const Query = query(
            collection(firestore, "Chat"), 
            orderBy("Time", "desc"), 
            limit(PaginationSize)
        )
        return onSnapshot(Query, async (snapshot) => {
            setMessages((prevMessages) => {
                // Get Messages
                let Messages = [...prevMessages]
                // Set Cursor (on Initialization)
                if (Messages.length == 0) {
                    setMessagesCursor(snapshot.docs[snapshot.docs.length - 1])
                }
                // Merge New Messages & Previous Messages
                snapshot.docs.forEach((snapshot) => {
                    // Check if New Message has Time (Local Input Instant Snapshot Callback)
                    if (snapshot.data().Time === null) {return}
                    // Check if Message already Exists in Messages
                    if (Messages.find((element) => element.Id === snapshot.id)) {return}
                    // Add Message
                    const document = getDocMessageFormat(snapshot)
                    Messages.push(document)
                })
                // Sort by Time
                Messages.sort(function(doc1, doc2) {
                    return doc2.Time.valueOf() - doc1.Time.valueOf()
                })
                // Loading
                setLoading(false)
                // Return
                return Messages
            })
        })
    }

    // Load More Button
    const getNextMessagesHistory = async () => {
        // Load History
        const Query = query(
            collection(firestore, "Chat"), 
            orderBy("Time", "desc"), 
            startAfter(messagesCursor),
            limit(PaginationSize)
        )
        const QuerySnapshot = await getDocs(Query)
        // Iterate Messages
        let Messages = []
        QuerySnapshot.forEach((snapshot) => {
            // Add Messages
            Messages.push(getDocMessageFormat(snapshot))
        })
        // Merge New & Old History
        setMessages((prevMessages) => {
            return [...prevMessages, ...Messages]
        })
        // Set Cursor (Last Document)
        // Verify next Page Exists
        if (QuerySnapshot.docs.length !== 0) {
            setMessagesCursor(QuerySnapshot.docs[QuerySnapshot.docs.length - 1])
        } else {
            setMessagesCursor(false)
        }
    }

    const getDocMessageFormat = (doc) => {
        // Document
        let Id = doc.id
        // Data
        const data = doc.data()
        let Text = data.Text
        let Time = data.Time
        let uid = data.uid
        return {Id, uid, Text, Time, Username: null, Photo: null}
    }

    const ChatMessage = (Message) => {
        const {Id, uid, Text, Time, Username, Photo} = Message.data
        // Time
        let timeFormatted = ""
        if (Time) {
            let date = new Date(Time.seconds * 1000)
            let timeFormattedClassic = "(" + (date.getMonth() + 1) + "/" + (date.getDate()) + ")"
            timeFormatted = formatDistanceToNow(date, {addSuffix: true}) + " " + timeFormattedClassic
        }
        // Return
        return (
            <div className="ChatItem">
                <img src={Photo} className="ChatItemImage"/>
                <div>
                    <div><b>{Username}</b>   <i className="ChatItemTimeText">{timeFormatted}</i></div>
                    <div>{Text}</div>
                </div>
            </div>
        )
    }

    const LoadMoreButton = () => {
        return (
            <button onClick={getNextMessagesHistory} className="ButtonRounded ButtonLightBlue">Load More...</button>
        )
    }

    const EndOfHistoryLabel = () => {
        return (
            <div onClick={getNextMessagesHistory} className="ContainerGray">End of Message History</div>
        )
    }

    const scrollToNewest = () => {
        if (scrollRef) {
            scrollRef.current.scrollIntoView({behavior:"smooth"})
        }
    }
    
    return (
        <div className="Chatbox">
            <LoadingFrame loading={loading}/>
            <ul className="ChatboxScroll">
                <div ref={scrollRef}></div>
                {messages.map(msg => { 
                    return <ChatMessage key={msg.Id} data={msg}/>
                })} 
                {((messages.length >= PaginationSize) && (messagesCursor !== false)) 
                ? <LoadMoreButton/> : <></>}
                {(messagesCursor === false) ? 
                <EndOfHistoryLabel/> : <></>}
            </ul>
            <ChatInput/>
        </div>
    )
}