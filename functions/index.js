const app = require('express')()
const { db } = require('./util/admin')
const functions = require('firebase-functions')

const {
  getScreams,
  postScream,
  getScream,
  postScreamComment,
  likeScream,
  unlikeScream,
  deleteScream
} = require('./handlers/screams')
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails
} = require('./handlers/users')
const { FBAuth } = require('./util/fbAuth')

// Scream routes
app.get('/screams', getScreams)
app.post('/scream', FBAuth, postScream)
app.get('/scream/:screamId', getScream)
app.post('/scream/:screamId/comment', FBAuth, postScreamComment)
app.get('/scream/:screamId/like', FBAuth, likeScream)
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream)
app.delete('/scream/:screamId', FBAuth, deleteScream)

// User routes
app.post('/signup', signup)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage)
app.post('/user', FBAuth, addUserDetails)
app.get('/user', FBAuth, getAuthenticatedUser)
app.get('/user/:userHandle', getUserDetails)

// automatically turns into routes with /api/
// also changes .region
exports.api = functions.region('europe-west1').https.onRequest(app)

exports.createNotificationOnLike = functions
  .region('europe-west1')
  .firestore.document('likes/{id}')
  .onCreate(snapshot => {
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            createdAt: new Date().toISOString(),
            screamId: doc.id
          })
        }
      })
      .then(() => {
        return
      })
      .catch(err => {
        console.error(err)
        return
      })
  })

exports.deleteNotificationOnUnlike = functions
  .region('europe-west1')
  .firestore.document('/likes/{id}')
  .onDelete(snapshot => {
    db.doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return
      })
      .catch(err => {
        console.log(err)
        return
      })
  })

exports.createNotificationOnComment = functions
  .region('europe-west1')
  .firestore.document('comments/{id}')
  .onCreate(snapshot => {
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            createdAt: new Date().toISOString(),
            screamId: doc.id
          })
        }
      })
      .then(() => {
        return
      })
      .catch(err => {
        console.error(err)
        return
      })
  })
