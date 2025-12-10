# sending_mail

# Server Port
PORT=

# SMTP
SMTP_HOST=

SMTP_PORT=

SMTP_USER=

SMTP_PASS=

CC_EMAILS=

# API Description

## Contact Form Endpoint

**Endpoint:** `POST http://localhost:5000/contact`

**Description:** Submits a contact form and sends emails in the background. The API responds immediately with a success message, and emails are sent asynchronously.

### Request Payload

**Content-Type:** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | ✅ Yes | User's first name |
| `lastName` | string | ❌ No | User's last name |
| `email` | string | ✅ Yes | User's email address |
| `country` | string | ❌ No | User's country |
| `organisation` | string | ❌ No | User's organization/company |
| `lookingFor` | string | ❌ No | What the user is looking for |
| `message` | string | ❌ No | User's message/inquiry |

### Example Payload

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "johndoe@example.com",
  "country": "United Kingdom",
  "organisation": "ABC Pvt Ltd",
  "lookingFor": "Web Development Services",
  "message": "I'd like to discuss a new project with your team."
}
```

### Minimal Payload (Only Required Fields)

```json
{
  "firstName": "John",
  "email": "johndoe@example.com"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Contact form submitted successfully. Emails will be sent shortly."
}
```

### Error Responses

**400 Bad Request** - Missing required fields
```json
{
  "success": false,
  "error": "firstName and email fields are required"
}
```

**500 Internal Server Error** - Server error
```json
{
  "success": false,
  "error": "Failed to process contact form"
}
```

### Example cURL Request

```bash
curl -X POST http://localhost:5000/contact \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "johndoe@example.com",
    "country": "United Kingdom",
    "organisation": "ABC Pvt Ltd",
    "lookingFor": "Web Development Services",
    "message": "I'\''d like to discuss a new project with your team."
  }'
```

### Example JavaScript/Fetch Request

```javascript
fetch('http://localhost:5000/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'johndoe@example.com',
    country: 'United Kingdom',
    organisation: 'ABC Pvt Ltd',
    lookingFor: 'Web Development Services',
    message: 'I\'d like to discuss a new project with your team.'
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

### Notes

- The API responds immediately without waiting for emails to be sent
- Emails are sent in the background (admin notification and user thank-you email)
- Email sending errors are logged but don't affect the API response
- Only `firstName` and `email` are required fields

