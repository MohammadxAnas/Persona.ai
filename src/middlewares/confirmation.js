const nodemailer = require("nodemailer");

const sendConfirmationEmail = async (userEmail, confirmationCode) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "daemon11irving@gmail.com", 
            pass: "aqyyldtknagfiiyn", 
        },
    });

    const mailOptions = {
        from: "daemon11irving@gmail.com",
        to: userEmail,
        subject: "Email Confirmation Code",
        text: `Your confirmation code is: ${confirmationCode}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = { sendConfirmationEmail };
