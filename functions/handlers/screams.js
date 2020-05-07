const { db } = require('../util/admin')

/*
  Scream Routes:
  1. GET ALL SCREAMS
  2. GET SCREAM
  3. POST SCREAMS
  4. POST SCREAM COMMENT
*/

// 1. GET ALL SCREAMS
exports.getScreams = (req, res) => {
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
    .catch(err => {
      console.error(err)
      return res.status(500).json({ error: err.code })
    })
}

// 2. GET SCREAM
exports.getScream = (req, res) => {
  let screamData = {}

  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' })
      }
      screamData = doc.data()
      screamData.screamId = doc.id
      return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('screamId', '==', req.params.screamId)
        .get()
    })
    .then(data => {
      screamData.comments = []
      data.forEach(doc => {
        screamData.comments.push(doc.data())
      })
      return res.json(screamData)
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json({ error: err.code })
    })
}

// 3. POST SCREAM
exports.postScream = (req, res) => {
  // return an error if request is not POST
  if (req.method !== 'POST') {
    return res.status(400).json({ error: 'Method not allowed' })
  }

  //the body of the scream when request is being send
  const newScream = {
    body: req.body.body,
    userHandle: req.user.userHandle,
    createdAt: new Date().toISOString()
  }

  db.collection('screams')
    .add(newScream)
    .then(doc => {
      return res.json({
        message: `document ${doc.id} has been created succesfully`
      })
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json({ error: 'something went wrong' })
    })
}

// 4. POST SCREAM COMMENT

exports.postScreamComment = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(400).json({ error: 'Method not allowed' })
  }

  if (req.body.body.trim() === '')
    return res.status(400).json({ error: 'Must not be empty' })

  const newComment = {
    body: req.body.body,
    userHandle: req.user.userHandle,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    userImage: req.user.imageUrl
  }

  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' })
      }
      return db.collection('comments').add(newComment)
    })
    .then(() => {
      return res.json(newComment)
    })
    .catch(err => {
      console.log(err)
      return res.status(500).json({ error: 'Something went wrong' })
    })
}
