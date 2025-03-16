const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const { ENV } = require("./config/env");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { sendEmail } = require('./utils/mailservice'); // Import the mail function


const prisma = new PrismaClient();
const app = express();
const nodemailer = require("nodemailer");


app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use(cors({
  origin: "http://localhost:5174",
  credentials: true,
}));

// Home route
app.get("/", (req, res) => {
  console.log(req.cookies);
  res.send("hello");
});


// Fetch all users with related startups
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({ include: { startups: true } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

app.get("/api/v1/applications", async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      include: { user: true },
    });
    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Error fetching applications" });
  }
});

// ✅ CREATE APPLICATION (POST)
app.post("/api/v1/applications", async (req, res) => {
  try {
    const { userId, title, otherFields } = req.body;

    // ✅ Validate required fields
    if (!userId || !title) {
      return res.status(400).json({ error: "userId and title are required" });
    }

    const newApplication = await prisma.application.create({
      data: { userId, title, otherFields },
    });

    res.status(201).json(newApplication);
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).json({ error: "Failed to create application" });
  }
});








app.patch("/api/v1/applications/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedApplication = await prisma.application.update({
      where: { id: Number(id) },
      include: { user: true }, // Ensure user data is included
      data: { status },
    });

    const email = updatedApplication.user?.email;
    if (!email) {
      console.error("User email not found for application ID:", id);
      return res.status(400).json({ error: "User email not found" });
    }

    console.log("Sending email to:", email, "with status:", status);

    let emailResult;
if (status.toLowerCase() === "approved") {
  console.log("Sending approval email...");
  emailResult = await sendEmail(email, "approval", "");
} else if (status.toLowerCase() === "rejected") {
  console.log("Sending rejection email...");
  emailResult = await sendEmail(email, "rejection", "");
}

// Check if email sending failed
if (!emailResult?.success) {
  console.error("🚨 Email sending failed:", emailResult?.message);
}

    res.json({ message: "Application status updated", updatedApplication });
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).json({ error: "Failed to update application status" });
  }
});




const otpStore = {};



require('dotenv').config();
const secretKey = process.env.JWT_SECRET || "random"; // Define secretKey

// Replace the existing OTP routes with these fixed versions



// Helper function to ensure consistent email format
function normalizeEmail(email) {
  return decodeURIComponent(email).toLowerCase().trim();
}

// Send OTP API
app.post("/api/v1/send-otp", async (req, res) => {
  const rawEmail = req.body.email;
  const email = normalizeEmail(rawEmail);
  console.log("Raw email:", rawEmail);
  console.log("Normalized email for OTP:", email);
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated OTP for ${email}: ${otp}`);
    
    // Clear any existing OTP for this user
    otpStore[email] = otp;
    
    console.log("Current OTP store:", otpStore);

    // Use the sendEmail function from your mail service
    const emailResult = await sendEmail(email, "otp", otp);
    
    if (!emailResult.success) {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    const tempToken = jwt.sign({ email }, secretKey, { expiresIn: "5m" });
    return res.json({ 
      message: "OTP sent successfully", 
      tempAuthToken: tempToken,
      debug: { normalizedEmail: email } // This helps debugging - remove in production
    });
  } catch (error) {
    console.error("Error in sending OTP:", error);
    return res.status(500).json({ message: "Server error, please try again." });
  }
});

// Verify OTP API
app.post("/api/v1/verify-otp", async (req, res) => {
    const rawEmail = req.body.email;
    const email = normalizeEmail(rawEmail);
    const { otp } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    
    console.log("Verifying OTP for normalized email:", email);
    console.log("Submitted OTP:", otp);
    console.log("Current OTP store:", otpStore);
    console.log("Expected OTP from store:", otpStore[email]);
    
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    
    try {
        jwt.verify(token, secretKey);
        
        if (!otpStore[email]) {
            return res.status(400).json({ message: "No OTP found for this email" });
        }
        
        if (otpStore[email] !== otp) {
            return res.status(400).json({ 
                message: "Invalid OTP",
                debug: { 
                    providedOtp: otp,
                    expectedOtp: otpStore[email],
                    normalizedEmail: email
                } // This helps debugging - remove in production
            });
        }
        
        delete otpStore[email]; // Remove OTP after verification
        const authToken = jwt.sign({ email }, secretKey, { expiresIn: "1h" });
        res.json({ message: "OTP verified", authToken });
    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(401).json({ message: "Invalid token" });
    }
});


// User login
app.post("/api/v1/user_login", async (req, res) => {
  try {
    const {  password } = req.body;
    const email = decodeURIComponent(req.body.email);

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, ENV.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "Lax",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});
