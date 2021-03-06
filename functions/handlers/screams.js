const { db } = require('../util/admin')

/*
  Scream Routes:
  1. GET ALL SCREAMS
  2. GET SCREAM
  3. POST SCREAMS
  4. POST SCREAM COMMENT
  5. LIKE SCREAM
  6. UNLIKE SCREAM
  7. DELETE SCREAM
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
          createdAt: doc.data().createdAt,
          userImage: doc.data().userImage
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
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0
  }

  db.collection('screams')
    .add(newScream)
    .then(doc => {
      const resScream = newScream
      resScream.screamId = doc.id
      return res.json(resScream)
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
    return res.status(400).json({ comment: 'Must not be empty' })

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
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 })
    })
    .then(() => {
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

// 5. LIKE SCREAM

exports.likeScream = (req, res) => {
  const likeDocument = db
    .collection('likes')
    .where('userHandle', '==', req.user.userHandle)
    .where('screamId', '==', req.params.screamId)
    .limit(1)

  const screamDocument = db.doc(`/screams/${req.params.screamId}`)

  let screamData

  screamDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        screamData = doc.data()
        screamData.screamId = doc.id
        return likeDocument.get()
      } else {
        return res.status(404).json({ error: 'Scream not found' })
      }
    })
    .then(data => {
      if (data.empty) {
        return db
          .collection('likes')
          .add({
            screamId: req.params.screamId,
            userHandle: req.user.userHandle
          })
          .then(() => {
            screamData.likeCount++
            return screamDocument.update({ likeCount: screamData.likeCount })
          })
          .then(() => {
            return res.json(screamData)
          })
      } else {
        return res.status(400).json({ error: 'Scream already liked' })
      }
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: err.code })
    })
}

// 6. UNLIKE SCREAM

exports.unlikeScream = (req, res) => {
  const likeDocument = db
    .collection('likes')
    .where('userHandle', '==', req.user.userHandle)
    .where('screamId', '==', req.params.screamId)
    .limit(1)

  const screamDocument = db.doc(`/screams/${req.params.screamId}`)

  let screamData

  screamDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        screamData = doc.data()
        screamData.screamId = doc.id
        return likeDocument.get()
      } else {
        return res.status(404).json({ error: 'Scream not found' })
      }
    })
    .then(data => {
      if (data.empty) {
        return res.status(400).json({ error: 'Scream not liked' })
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            screamData.likeCount--
            return screamDocument.update({ likeCount: screamData.likeCount })
          })
          .then(() => res.json(screamData))
      }
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: err.code })
    })
}

// 7. DELETE SCREAM

exports.deleteScream = (req, res) => {
  const document = db.doc(`/screams/${req.params.screamId}`)

  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' })
      }

      if (doc.data().userHandle !== req.user.userHandle) {
        return res.status(403).json({ error: 'Unauthorized' })
      } else {
        return document.delete()
      }
    })
    .then(() => {
      res.json({ message: 'scream deleted succesfully' })
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json({ error: err.code })
    })
}
