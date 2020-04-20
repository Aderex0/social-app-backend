const { config } = require('./config')

const admin = require('firebase-admin')
admin.initializeApp()

const db = admin.firestore()

module.exports = { admin, db }
