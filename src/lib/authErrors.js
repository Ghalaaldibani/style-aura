// Firebase error codes → friendly English messages (Nielsen #9: help users recognise and recover from errors).
const MESSAGES = {
  'auth/email-already-in-use': { field: 'email', message: 'An account with this email already exists. Try logging in instead.' },
  'auth/invalid-email': { field: 'email', message: 'This email address doesn’t look right.' },
  'auth/weak-password': { field: 'password', message: 'Please choose a stronger password (at least 8 characters).' },
  'auth/invalid-credential': { field: 'password', message: 'Email or password is incorrect. Check them and try again.' },
  'auth/wrong-password': { field: 'password', message: 'Email or password is incorrect. Check them and try again.' },
  'auth/user-not-found': { field: 'email', message: 'Email or password is incorrect. Check them and try again.' },
  'auth/missing-password': { field: 'password', message: 'Please enter your password.' },
  'auth/too-many-requests': { field: null, message: 'Too many attempts. Please wait a few minutes, or reset your password.' },
  'auth/network-request-failed': { field: null, message: 'No internet connection. Check your network and try again.' },
  'auth/requires-recent-login': { field: 'currentPassword', message: 'For your security, please enter your current password again.' },
  'auth/user-disabled': { field: null, message: 'This account has been disabled.' },
}

export function friendlyAuthError(error) {
  return MESSAGES[error?.code] ?? { field: null, message: 'Something went wrong. Please try again.' }
}
