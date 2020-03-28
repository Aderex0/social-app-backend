const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

const express = require('express')
const app = express()

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello world!')
})

app.get('/screams', (req, res) => {
  admin
    .firestore()
    .collection('screams')
    .get()
    .then(data => {
      let screams = []
      data.forEach(doc => {
        screams.push(doc.data())
      })
      return res.json(screams)
    })
    .catch(err => console.error())
})

app.post('/screams', (req, res) => {
  // return an error if request is not POST
  if (req.method !== 'POST') {
    return res.status(400).json({ error: 'Method not allowed' })
  }

  //the body of the scream when request is being send
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
  }

  admin
    .firestore()
    .collection('screams')
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} has been created succesfully` })
    })
    .catch(err => {
      res.status(500).json({ error: 'something went wrong' })
      console.error(err)
    })
})

// automatically turns into routes with /api/
exports.api = functions.https.onRequest(app)
