const app = require('express')()

const functions = require('firebase-functions')

const { getScreams, postScream } = require('./handlers/screams')
const { signup, login, uploadImage } = require('./handlers/users')
const { FBAuth } = require('./util/fbAuth')

// Scream routes
app.get('/screams', getScreams)
app.post('/scream', FBAuth, postScream)

// User routes
app.post('/signup', signup)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage)

// automatically turns into routes with /api/
// also changes .region
exports.api = functions.region('europe-west1').https.onRequest(app)
