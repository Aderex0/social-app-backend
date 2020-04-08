const express = require('express')
const app = express()

const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

const firebaseConfig = {
  apiKey: 'AIzaSyAuX277hjNb6lLCAifqlOwLwDttsQLe6_k',
  authDomain: 'educational-social-app.firebaseapp.com',
  databaseURL: 'https://educational-social-app.firebaseio.com',
  projectId: 'educational-social-app',
  storageBucket: 'educational-social-app.appspot.com',
  messagingSenderId: '341133056213',
  appId: '1:341133056213:web:08dea8dc4ef169483aaa5c',
  measurementId: 'G-RGPVCT5ZZY'
}

const firebase = require('firebase')
firebase.initializeApp(firebaseConfig)

const db = admin.firestore()

// GET scream
app.get('/screams', (req, res) => {
  db.collection('screams')
    // orders the get request by latests first
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let screams = []
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        })
      })
      return res.json(screams)
    })
    .catch(err => console.error(err))
})

//POST scream
app.post('/scream', (req, res) => {
  // return an error if request is not POST
  if (req.method !== 'POST') {
    return res.status(400).json({ error: 'Method not allowed' })
  }

  //the body of the scream when request is being send
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  }

  db.collection('screams')
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} has been created succesfully` })
    })
    .catch(err => {
      res.status(500).json({ error: 'something went wrong' })
      console.error(err)
    })
})

const isEmpty = string => {
  if (string.trim() === '') {
    return true
  } else {
    return false
  }
}

const isEmail = email => {
  const regEx = /[^@]+@[^\.]+\..+/
  if (email.match(regEx)) {
    return true
  } else {
    return false
  }
}

//POST signup
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    userHandle: req.body.userHandle
  }

  let errors = {}

  if (isEmpty(newUser.email)) {
    errors.email = 'Must not be empty'
  } else if (!isEmail(newUser.email)) {
    errors.email = 'Must be a valid email address'
  }

  if (isEmpty(newUser.password)) errors.password = 'Must not be empty'
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = 'Passwords must match'
  if (isEmpty(newUser.userHandle)) errors.userHandle = 'Must not be empty'

  if (Object.keys(errors).length > 0) return res.status(400).json(errors)

  let token, userId
  db.doc(`/users/${newUser.userHandle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: 'this handle is already taken' })
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then(data => {
      userId = data.user.uid
      return data.user.getIdToken()
    })
    .then(idToken => {
      token = idToken
      const userCredentials = {
        userHandle: newUser.userHandle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      }
      return db.doc(`/users/${newUser.userHandle}`).set(userCredentials)
    })
    .then(() => {
      return res.status(201).json({ token })
    })
    .catch(err => {
      console.error(err)
      if (err.code == 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'email is already in use' })
      } else {
        return res.status(500).json({ error: err.code })
      }
    })
})

// automatically turns into routes with /api/
exports.api = functions.region('europe-west1').https.onRequest(app)
