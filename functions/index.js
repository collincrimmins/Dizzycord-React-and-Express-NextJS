/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { firestore } = require("firebase-admin");
admin.initializeApp();

// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
// const {logger} = require("firebase-functions");
// const {onRequest} = require("firebase-functions/v2/https");
// const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// // The Firebase Admin SDK to access Firestore.
// const {initializeApp} = require("firebase-admin/app");
// const {getFirestore} = require("firebase-admin/firestore");

// initializeApp();


// Create Post
exports.CreatePost = functions.https.onCall((Data, Context) => {
  return new Promise(async function(resolve, reject) {
    
  })
});

// Get All Users Profile (for Chat)
exports.FirestoreGetArrayUserProfiles = functions.https.onCall((Data, Context) => {
  return new Promise(async function(resolve, reject) {
    // Get User
    const User = Context.auth
    if (!User) {
      return resolve({status: "error", message: "You are not Logged in."})
    }
    // Get Doc Refs
    let requestDocs = []
    Data.forEach((v) => {
      const docRef = admin.firestore().collection("Users").doc(v)
      requestDocs.push(docRef)
    })
    // Get All
    admin.firestore().getAll(...requestDocs)
    .then((result) => {
      // Get Data from Doc Snapshots
      let returnDocs = []
      result.forEach((v) => {
        returnDocs.push(v.data())
      })
      return resolve(returnDocs)
    })
    .catch((error) => {
      return resolve({status: "error", message: "Error getting documents."})
    })
  })
});

// Set Username 
exports.SetUsername = functions.https.onCall((Data, Context) => {
  return new Promise(async function(resolve, reject) {
    // Get User
    const User = Context.auth
    if (!User) {
      return resolve({status: "error", message: "You are not Logged in."})
    }
    // Verify Input
    const newUsername = Data.Username
    if (newUsername === "") {
      return resolve({status: "error", message: "Invalid Username."})
    }
    if (!/\S/.test(newUsername)) {
      return resolve({status: "error", message: "Invalid Username."})
    }
    // Set Username
    await admin.firestore().collection("Users").doc(User.uid).get()
    .then((docSnap) => {
      // Check User Owns Document
      if (UserOwnsDocument(User, docSnap)) {
        // Set Username
        admin.firestore().collection("Users").doc(User.uid).update({
          Username: newUsername,
        })
        .then(() => {
          resolve({status: "ok", Username: newUsername})
        })
        .catch((error) => {
          printError(error)
          return resolve({status: "error", message: "Server Error."})
        })
      } else {
        return resolve({status: "error", message: "You cannot access that."})
      }
    })
    // // Set Username
    // admin.firestore().collection("Users").doc(User.uid).update({
    //   Username: newUsername,
    // })
    // .then(() => {
    //   resolve({status: "ok", Username: newUsername})
    // })
    // .catch((error) => {
    //   printError(error)
    //   reject()
    // })
  })
});

// Random Number
exports.RandomNumber = functions.https.onCall((Data, Context) => {
  // if (!Context.auth) return {status: 'error', code: 401, message: 'Not signed in'}
  console.log(Data)
  return("test")
});













// User Created
exports.newUserSignup = functions.auth.user().onCreate((user) => {
  // Get Username
  const newUsername = "NewUser_" + Math.random().toString(36).substring(2, 10);
  // Create "Users" Collection
  admin.firestore().collection("Users").doc(user.uid).set({
    uid: user.uid,
    Username: newUsername,
    Photo: "https://play-lh.googleusercontent.com/6UgEjh8Xuts4nwdWzTnWH8QtLuHqRMUB7dp24JYVE2xcYzq4HA8hFfcAbU-R-PC_9uA1",
  });
  // Create "Feeds" Collection
  admin.firestore().collection("Profiles").doc(user.uid).set({
    uid: user.uid,
  });
  // Return
  return true;
});













const UserOwnsDocument = (User, docRef) => {
  return User.uid === docRef.id
}

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const printError = (error) => {
  console.warn("API Error:")
  console.warn(error.code + " (" + error.message + ")")
  console.warn(error.details)
  return "Error"
}







let RunningLocally
if (process.env.FUNCTIONS_EMULATOR) {
  // Emulator Mode
  RunningLocally = true
}
