const app = require('express')()

const functions = require('firebase-functions')

const {
  getScreams,
  postScream,
  getScream,
  postScreamComment,
  likeScream
} = require('./handlers/screams')
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser
} = require('./handlers/users')
const { FBAuth } = require('./util/fbAuth')

// Scream routes
app.get('/screams', getScreams)
app.post('/scream', FBAuth, postScream)
app.get('/scream/:screamId', getScream)
app.post('/scream/:screamId/comment', FBAuth, postScreamComment)
app.get('/scream/:screamId/like', FBAuth, likeScream)

// User routes
app.post('/signup', signup)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage)
app.post('/user', FBAuth, addUserDetails)
app.get('/user', FBAuth, getAuthenticatedUser)

// automatically turns into routes with /api/
// also changes .region
exports.api = functions.region('europe-west1').https.onRequest(app)
