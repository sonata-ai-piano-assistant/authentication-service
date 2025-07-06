const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL

async function sendRegistrationEmail({ userId, email, consent }) {
  return fetch(`${NOTIFICATION_SERVICE_URL}/notifications/email/registration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email, consent })
  })
}

async function sendPasswordResetEmail({ userId, email, code, consent }) {
  return fetch(
    `${NOTIFICATION_SERVICE_URL}/notifications/email/password-reset`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, email, code, consent })
    }
  )
}

async function sendRegistrationSMS({ userId, phone, consent }) {
  return fetch(`${NOTIFICATION_SERVICE_URL}/notifications/sms/registration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, phone, consent })
  })
}

async function sendPasswordResetSMS({ userId, phone, code, consent }) {
  return fetch(`${NOTIFICATION_SERVICE_URL}/notifications/sms/password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, phone, code, consent })
  })
}

module.exports = {
  sendRegistrationEmail,
  sendPasswordResetEmail,
  sendRegistrationSMS,
  sendPasswordResetSMS
}
