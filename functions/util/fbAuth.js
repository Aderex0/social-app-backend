const admin = require('./admin')

//Middleware to confirm that scream is being posted by correct user
exports.FBAuth = (req, res, next) => {
  let idToken
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    idToken = req.headers.authorization.split('Bearer ')[1]
    console.log(idToken)
  } else {
    console.error('No token found')
    return res.status(403).json({ error: 'Unauthorized' })
  }

  //vertifying that the token is being issued by our application
  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken
      console.log(decodedToken)
      return db
        .collection('users')
        .where('userId', '==', req.user.uid)
        .limit(1)
        .get()
    })
    .then(data => {
      req.user.userHandle = data.docs[0].data().userHandle
      return next()
    })
    .catch(err => {
      console.error('Error while verifying token', err)
      return res.status(403).json(err)
    })
}
