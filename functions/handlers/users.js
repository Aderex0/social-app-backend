const { config } = require('../util/config')
const { admin, db } = require('../util/admin')
const {
  validateSignupData,
  validateLoginData,
  reduceUserDetails
} = require('../util/validators')

const firebase = require('firebase')
firebase.initializeApp(config)

/* 
  Route Contents
  1. SIGNUP NEW USER
  2. LOGIN USER
  3. ADD USER DETAILS
  4. GET USER DETAILS
  5. GET OTHER USER DETAILS
  6. UPLOAD USER IMAGE
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

  const noImg = 'no-image.jpg'

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
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
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

// 3. ADD USER DETAILS
exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body)

  db.doc(`/users/${req.user.userHandle}`)
    .update(userDetails)
    .then(() => {
      return res.json({ message: 'details added succesfully' })
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json({ error: err.code })
    })
}

// 4. GET USER DETAILS

exports.getAuthenticatedUser = (req, res) => {
  let userData = {}

  db.doc(`/users/${req.user.userHandle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.credentials = doc.data()
        return db
          .collection('likes')
          .where('userHandle', '==', req.user.userHandle)
          .get()
      }
    })
    .then(data => {
      userData.likes = []
      data.forEach(doc => {
        userData.likes.push(doc.data())
      })
      return db
        .collection('notifications')
        .where('recipient', '==', req.user.userHandle)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get()
    })
    .then(data => {
      userData.notifications = []
      data.forEach(doc => {
        userData.notifications.push({
          recipient: doc.data().recipient,
          sender: doc.data().sender,
          createdAt: doc.data().createdAt,
          screamId: doc.data().screamId,
          type: doc.data().type,
          read: doc.data().read,
          notificationId: doc.id
        })
      })
      return res.json(userData)
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json({ error: err.code })
    })
}

// 5. GET OTHER USER DETAILS

exports.getUserDetails = (req, res) => {
  let userData = {}

  db.doc(`/users/${req.params.userHandle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.user = doc.data()
        return db
          .collection('screams')
          .where('userHandle', '==', req.params.userHandle)
          .orderBy('createdAt', 'desc')
          .get()
      } else res.status(404).json({ error: 'User not found' })
    })
    .then(data => {
      userData.screams = []
      data.forEach(doc => {
        userData.screams.push({
          body: doc.data().body,
          createdAt: doc.data().createdAt,
          userHandle: doc.data().userHandle,
          userImage: doc.data().userImage,
          likeCount: doc.data().likeCount,
          commentCount: doc.data().commentCount,
          screamId: doc.id
        })
      })
      return res.json(userData)
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json({ error: err.code })
    })
}

// 6. UPLOAD USER IMAGE
exports.uploadImage = (req, res) => {
  const BusBoy = require('busboy')
  const path = require('path')
  const os = require('os')
  const fs = require('fs')

  const busboy = new BusBoy({ headers: req.headers })

  let imageFileName
  let imageToBeUploaded = {}

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      return res.status(400).json({ error: 'Wrong file type submited' })
    }
    const imageExtension = filename.split('.')[filename.split('.').length - 1]
    const imageFileName = `${Math.round(
      Math.random() * 1000000000000
    )}.${imageExtension}`
    const filepath = path.join(os.tmpdir(), imageFileName)
    imageToBeUploaded = { filepath, mimetype }
    file.pipe(fs.createWriteStream(filepath))
  })
  busboy.on('finish', () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`
        return db
          .doc(`/users/${req.user.userHandle}`)
          .update({ imageUrl: imageUrl })
      })
      .then(() => {
        return res.json({ message: 'Image uploaded succesfully' })
      })
      .catch(err => {
        console.error(err)
        return res.status(500).json({ error: err.code })
      })
  })
  busboy.end(req.rawBody)
}
