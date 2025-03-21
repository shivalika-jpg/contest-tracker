require("dotenv").config();
const express = require("express");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
app.use(express.json());  // ✅ Ensure JSON body parsing
app.use(cors());

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post("/send-sms", async (req, res) => {
    const { phoneNumber, message } = req.body;

    // ✅ Check if phoneNumber & message are provided
    if (!phoneNumber || !message) {
        return res.status(400).json({ success: false, error: "Phone number and message are required!" });
    }

    try {
        const response = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,  // ✅ Twilio number from .env
            to: phoneNumber,  // ✅ Correctly passing the phone number
        });

        console.log("✅ SMS sent:", response.sid);
        res.json({ success: true, message: "SMS sent successfully!" });

    } catch (error) {
        console.error("❌ Full Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
