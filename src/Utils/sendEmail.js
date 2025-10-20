import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, otp) => {
  try {
   
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    // ✅ Define your email content
    const mailOptions = {
      from: `"Muhammad Muaaz Ali | CodeWithMuaaz" <${process.env.EMAIL_USER}>`,
      to,
      subject: subject || "🌟 Verification Code from CodeWithMuaaz",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      html: `
        <div style="
          font-family: 'Segoe UI', Arial, sans-serif;
          background-color: #f7f9fc;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          max-width: 500px;
          margin: auto;
          color: #333;
        ">
          <h2 style="color: #0078ff; text-align: center;">CodeWithMuaaz</h2>
          <p style="font-size: 16px;">Assalam-o-Alaikum 👋,</p>
          <p style="font-size: 15px;">
            Thank you for connecting with <strong>CodeWithMuaaz</strong>!  
            Please use the following verification code:
          </p>
          <div style="
            background-color: #0078ff;
            color: white;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            padding: 10px;
            border-radius: 6px;
            letter-spacing: 2px;
            margin: 20px 0;
          ">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #555;">
            This code will expire in <strong>5 minutes</strong>.  
            Please do not share it with anyone for security reasons.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 13px; color: #777; text-align: center;">
            — Muhammad Muaaz Ali<br>
            Founder | CodeWithMuaaz<br>
            <a href="https://codewithmuaaz.online" style="color:#0078ff; text-decoration:none;">codewithmuaaz.online</a>
          </p>
        </div>
      `,
    };

  
    await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw new Error("Failed to send email. Please try again.");
  }
};
