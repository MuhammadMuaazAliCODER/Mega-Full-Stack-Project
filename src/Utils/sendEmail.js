import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or use SMTP for production
    auth: {
      user: process.env.EMAIL_USER, // your Gmail or SMTP email
      pass: process.env.EMAIL_PASS, // app password (not personal password)
    },
  });

  const mailOptions = {
    from: `"Muhammad Muaaz ALi" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};
