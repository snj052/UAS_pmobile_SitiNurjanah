// lib/csrf.js
import Tokens from 'csrf'

const tokens = new Tokens()

export async function generateCSRFToken() {
  const secret = await tokens.secret()
  const token = tokens.create(secret)
  return { token, secret }
}

export async function verifyCSRFToken(token, secret) {
  return tokens.verify(secret, token)
}
