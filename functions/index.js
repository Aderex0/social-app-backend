const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

const express = require('express')
const app = express()

app.get('/screams', (req, res) => {
  admin
    .firestore()
    .collection('screams')
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
