const nodemailer = require("nodemailer");
const { convert } = require("html-to-text");

const createTransporter = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      // debug: true, /* Not used */
      // logger: true, /* Not used */
    });
  } catch (error) {
    throw error;
  }
};

const sendEmail = async ({ to, subject, htmlContent }) => {
  try {
    const transporter = await createTransporter();
    const textContent = convert(htmlContent);

    const info = await transporter.sendMail({
      from: "Admin <admin@express-tours.com>",
      to: to,
      subject: subject,
      html: htmlContent,
      text: textContent,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    throw error;
  }
};

module.exports = sendEmail;
