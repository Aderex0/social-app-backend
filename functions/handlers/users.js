const { config } = require('../util/config')
const { db } = require('../util/admin')
const { validateSignupData, validateLoginData } = require('../util/validators')

const firebase = require('firebase')
firebase.initializeApp(config)

/* 
  Route Contents
  1. SIGNUP NEW USER
  2. LOGIN USER
  3. UPLOAD USER IMAGE
*/

// 1. SIGNUP NEW USER
exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    userHandle: req.body.userHandle
  }

  const { valid, errors } = validateSignupData(newUser)
  if (!valid) return res.status(400).json(errors)

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
}

// 2. LOGIN USER
exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }

  const { valid, errors } = validateLoginData(user)
  if (!valid) return res.status(400).json(errors)

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken()
    })
    .then(token => {
      return res.json({ token })
    })
    .catch(error => {
      console.log(error)

      if (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        return res
          .status(403)
          .json({ general: 'wrong credentials please try again' })
      } else {
        return res.status(500).json({ error: err.code })
      }
    })
}

// 3. UPLOAD USER IMAGE
exports.uploadImage = (req, res) => {}
