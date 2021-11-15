const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  //create a transporter
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    // host: process.env.SMTP_HOST,
    // port: process.env.SMTP_PORT,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  //define the email options
  const mailOptions = {
    from: "noreply <noreply@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //actually send the email

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
