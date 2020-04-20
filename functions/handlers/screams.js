const { db } = require('../util/admin')

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
