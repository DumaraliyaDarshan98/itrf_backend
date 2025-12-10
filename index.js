require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://localhost:4200', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:4200', 'http://127.0.0.1:5173'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            // For development, allow all localhost origins
            if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

app.use(express.json());

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false, // use true for port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false, // bypass self-signed cert issues
    },
});

console.log("SMTP_HOST", process.env.SMTP_HOST);
console.log("SMTP_PORT", process.env.SMTP_PORT);
console.log("SMTP_USER", process.env.SMTP_USER);
console.log("SMTP_PASS", process.env.SMTP_PASS);
// console.log("SMTP_HOST", process.env.SMTP_HOST);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Mail Sender API is running" });
});

// Handle CORS preflight requests for /contact endpoint
app.options("/contact", (req, res) => {
    res.status(204).end();
});

// API route to send mail
// Helper function to send emails in the background
async function sendEmailsInBackground(emailData) {
    try {
        // -------------------------//
        // 1) MAIL TO ARIF (ADMIN)
        // -------------------------//
        const adminMail = {
            from: `"ITRF (Global) Ltd" <${process.env.SMTP_USER}>`,
            // to: ["darshandumaraliya@gmail.com"],
            to: ["arif@itrfg.com", "arif.shaik@hotmail.co.uk"],
            subject: "New Contact Form Submission Received",
            text: `
                Hi Arif,

                A new enquiry has been submitted through the ITRF (Global) Ltd website.

                Please find the details below:
                Name: ${emailData.firstName} ${emailData.lastName}
                Country: ${emailData.country || "Not provided"}
                Email: ${emailData.email}
                Organisation: ${emailData.organisation || "Not provided"}
                I am looking for: ${emailData.lookingFor}
                Message:
                ${emailData.message}

                Please review and follow up as required.

                Thanks,
                ITRF (Global) Ltd – Web Notifications
            `,
            html: `
                <p>Hi Arif,</p>
                <p>A new enquiry has been submitted through the <b>ITRF (Global) Ltd</b> website.</p>

                <p>Please find the details below:</p>
                <ul>
                <li><b>Name:</b> ${emailData.firstName} ${emailData.lastName}</li>
                <li><b>Country:</b> ${emailData.country || "Not provided"}</li>
                <li><b>Email:</b> ${emailData.email}</li>
                <li><b>Organisation:</b> ${emailData.organisation || "Not provided"}</li>
                <li><b>I am looking for:</b> ${emailData.lookingFor}</li>
                <li><b>Message:</b><br>${emailData.message.replace(/\n/g, "<br>")}</li>
                </ul>

                <p>Please review and follow up as required.</p>

                <p>Thanks,<br>
                ITRF (Global) Ltd – Web Notifications</p>
            `,
        };

        await transporter.sendMail(adminMail);
        console.log("Admin email sent successfully");

        // -------------------------//
        // 2) THANK YOU MAIL TO USER
        // -------------------------//
        const userMail = {
            from: `"ITRF (Global) Ltd" <${process.env.SMTP_USER}>`,
            to: emailData.email,
            subject: "Thank You for Reaching Out to ITRF (Global) Ltd",
            text: `
                Hi ${emailData.firstName},

                Thanks for reaching out. I'll look into your message soon and get back to you as soon as I can — usually within five business days.

                Since I'm connected with plenty of people and projects, there might be a bit of delay, but don't worry, it just means my head is full, not that I'm running around somewhere! 😄

                I'll reply as soon as I get a clear window to give your note the proper attention it deserves.

                Talk soon,  
                Arif Shaik  
                ITRF (Global) Ltd
            `,
            html: `
                <p>Hi ${emailData.firstName},</p>

                <p>Thanks for reaching out. I'll look into your message soon and get back to you as soon as I can — usually within five business days.</p>

                <p>Since I'm connected with plenty of people and projects, there might be a bit of delay, but don't worry, it just means my head is full, not that I'm running around somewhere! 😄</p>

                <p>I'll reply as soon as I get a clear window to give your note the proper attention it deserves.</p>

                <p>Talk soon,<br>
                <b>Arif Shaik</b><br>
                ITRF (Global) Ltd</p>
            `,
        };

        await transporter.sendMail(userMail);
        console.log("User email sent successfully");
    } catch (err) {
        console.error("Background email send error:", err);
        // Error is logged but doesn't affect the API response
    }
}

/**
 * POST /contact
 * 
 * Contact Form API Endpoint
 * 
 * Submits a contact form and sends emails in the background.
 * The API responds immediately with a success message, and emails are sent asynchronously.
 * 
 * @route POST /contact
 * @body {string} firstName - User's first name (required)
 * @body {string} lastName - User's last name (optional)
 * @body {string} email - User's email address (required)
 * @body {string} country - User's country (optional)
 * @body {string} organisation - User's organization/company (optional)
 * @body {string} lookingFor - What the user is looking for (optional)
 * @body {string} message - User's message/inquiry (optional)
 * 
 * @example
 * // Request Payload:
 * {
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "email": "johndoe@example.com",
 *   "country": "United Kingdom",
 *   "organisation": "ABC Pvt Ltd",
 *   "lookingFor": "Web Development Services",
 *   "message": "I'd like to discuss a new project."
 * }
 * 
 * @example
 * // Minimal Payload (only required fields):
 * {
 *   "firstName": "John",
 *   "email": "johndoe@example.com"
 * }
 * 
 * @returns {Object} 200 - Success response
 * @returns {boolean} success - true
 * @returns {string} message - Success message
 * 
 * @returns {Object} 400 - Bad request (missing required fields)
 * @returns {boolean} success - false
 * @returns {string} error - Error message
 * 
 * @returns {Object} 500 - Server error
 * @returns {boolean} success - false
 * @returns {string} error - Error message
 */
app.post("/contact", async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            country,
            organisation,
            lookingFor,
            message,
        } = req.body;

        if (!firstName || !email) {
            return res.status(400).json({
                success: false,
                error: "firstName and email fields are required",
            });
        }

        // Send success response immediately
        res.json({ success: true, message: "Contact form submitted successfully. Emails will be sent shortly." });

        // Send emails in the background (fire and forget)
        sendEmailsInBackground({
            firstName,
            lastName,
            email,
            country,
            organisation,
            lookingFor,
            message,
        }).catch(err => {
            console.error("Unhandled error in background email sending:", err);
        });
    } catch (err) {
        console.error("Contact form error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to process contact form",
        });
    }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
