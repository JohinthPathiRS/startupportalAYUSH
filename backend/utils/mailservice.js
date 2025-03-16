// utils/mailservice.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Set up a Nodemailer transporter with Gmail SMTP service credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "johinthpathi@gmail.com",
    pass: "mwzk vbaw naqy fror", // Use an App Password instead of a regular password for security
  },
});

/**
 * Send an email based on the type of notification
 * @param {string} email - Recipient's email address
 * @param {string} type - Type of email ('otp', 'approval', 'rejection')
 * @param {string} data - OTP code or additional info for the email
 */
async function sendEmail(email, type, data) {
  let mailOptions = {
    from: "johinthpathi@gmail.com",
    to: email, // Send to the provided email, not hardcoded
    subject: 'Notification from Ayush Portal',
  };
  console.log(type);
  console.log("ggyuhjnyu")

  switch (type) {
    case 'otp': // Add the missing OTP case
    console.log("OTP JJSNHDJFJ")
      mailOptions.subject = 'Your OTP Code';
      mailOptions.text = `Your OTP is ${data}`;
      break;
      
    case 'approval':
      console.log("APPROVAL TESR")
      mailOptions.text = `Congratulations! Your application has been approved.`;
      break;

    case 'rejection':
      mailOptions.text = `We regret to inform you that your application has been rejected. For further details, please contact support.`;
      break;

    default:
      throw new Error('Invalid email type');
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}: ${type}`);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: "Failed to send email" };
  }
}

module.exports = { sendEmail };