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
Endpoint : http://localhost:5000/contact

Payload :

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "johndoe@example.com",
  "phone": "+91-9876543210",
  "company": "ABC Pvt Ltd",
  "serviceInterest": "Web Development",
  "message": "I’d like to discuss a new project with your team."
}

# Example cURL Request
curl -X POST http://localhost:5000/contact \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "johndoe@example.com",
    "phone": "+91-9876543210",
    "company": "ABC Pvt Ltd",
    "serviceInterest": "Web Development",
    "message": "I’d like to discuss a new project with your team."
  }'

