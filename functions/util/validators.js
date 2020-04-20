const isEmpty = string => {
  if (string.trim() === '') {
    return true
  } else {
    return false
  }
}

const isEmail = email => {
  const regEx = /[^@]+@[^\.]+\..+/
  if (email.match(regEx)) {
    return true
  } else {
    return false
  }
}

exports.validateSignupData = data => {
  let errors = {}

  if (isEmpty(data.email)) {
    errors.email = 'Must not be empty'
  } else if (!isEmail(data.email)) {
    errors.email = 'Must be a valid email address'
  }

  if (isEmpty(data.password)) errors.password = 'Must not be empty'
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = 'Passwords must match'
  if (isEmpty(data.userHandle)) errors.userHandle = 'Must not be empty'

  return { errors, valid: Object.keys(errors).length === 0 ? true : false }
}

exports.validateSignupData = data => {
  let errors = {}

  if (isEmpty(user.email)) errors.email = 'Must not be empty'
  if (isEmpty(user.password)) errors.password = 'Must not be empty'

  return { errors, valid: Object.keys(errors).length === 0 ? true : false }
}