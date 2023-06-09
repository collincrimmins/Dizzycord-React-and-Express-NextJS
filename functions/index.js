// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {logger} = require("firebase-functions");
const {onRequest, onCall} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

// Must be used for Triggrs (like Auth onCreate)
const functions = require("firebase-functions");
// Must be used to access database
const admin = require('firebase-admin');

initializeApp();

const db = admin.firestore();

// Create Post
exports.CreatePost = onCall((Data, Context) => {
  return new Promise(async function(resolve, reject) {
    
  })
});

// Get User Profile (for Profile)
// exports.GetUserProfile = onRequest(async (req, res) => {
//   const data = req.body.data
//   // Get uid from Data
//   const uid = data
//   // Send User Profile
//   db.collection("Users").doc(uid)
//   .get()
//   .then((doc) => {
//     if (doc.exists) {
//       res.send({data: doc.data()})
//     }
//   })
// })

// Get All Users Profile (for Chat)
// exports.FirestoreGetArrayUserProfiles = onCall((request) => {
//     console.log(request.auth)
//     console.log(request.data)
//     // Get User
//     const User = request.auth
//     if (!User) {
//       return {status: "error", message: "You are not Logged in."}
//     }
//     // Get Doc Refs
//     let requestDocs = []
//     request.data.forEach((v) => {
//       const docRef = admin.firestore().collection("Users").doc(v)
//       requestDocs.push(docRef)
//     })
//     // Get All
//     admin.firestore().getAll(...requestDocs)
//     .then((result) => {
//       // Get Data from Doc Snapshots
//       let returnDocs = []
//       result.forEach((v) => {
//         returnDocs.push(v.data())
//       })
//       return returnDocs
//     })
//     .catch((error) => {
//       return {status: "error", message: "Error getting documents."}
//     })
// });

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

exports.EXAMPLE_ON_CALL = onCall((request) => {
  // Message text passed from the client.
  const text = request.data.text;
  // Authentication / user information is automatically added to the request.
  const uid = request.auth.uid;
  const name = request.auth.token.name || null;
  const picture = request.auth.token.picture || null;
  const email = request.auth.token.email || null;
  return {
    firstNumber: firstNumber,
    secondNumber: secondNumber,
    operator: "+",
    operationResult: firstNumber + secondNumber,
  };
});










// Triggers (not supported by v2)

// User Created
exports.newUserSignup = functions.auth.user().onCreate((user) => {
  // Get Username
  const newUsername = Math.random().toString(36).substring(2, 16);
  // "Users" & "UsersPublic"
  const BaseDocument = {
    uid: user.uid,
    Username: newUsername,
    Photo: "https://play-lh.googleusercontent.com/6UgEjh8Xuts4nwdWzTnWH8QtLuHqRMUB7dp24JYVE2xcYzq4HA8hFfcAbU-R-PC_9uA1",
  }
  admin.firestore().collection("Users").doc(user.uid).set(BaseDocument);
  admin.firestore().collection("UsersPublic").doc(user.uid).set(BaseDocument);
  // "Feeds"
  admin.firestore().collection("Profiles").doc(user.uid).set({
    uid: user.uid,
  });
  // Return
  return true;
});












// Functions

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







// Testing
exports.TestingAPILoaded = onRequest((req, res) => {
  res.send({data: true})
})

let RunningLocally
if (process.env.FUNCTIONS_EMULATOR) {
  // Emulator Mode
  RunningLocally = true
}

// exports.date = onRequest({cors: true}, (req, res) => {
//   // ...
// });

// exports.uppercase = onDocumentCreated("my-collection/{docId}", (event) => {
//   /* ... */
// });

// https://firebase.google.com/docs/functions/callable?gen=2nd