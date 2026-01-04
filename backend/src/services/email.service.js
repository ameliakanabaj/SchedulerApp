const nodemailer = require("nodemailer");

async function sendEmail(to, subject, htmlContent) {
  try {
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass, 
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const info = await transporter.sendMail({
      from: '"Scheduler System" <system@scheduler.com>',
      to: to,
      subject: subject,
      html: htmlContent,
    });

    console.log("---------------------------------------------------");
    console.log("EMAIL SENT (TEST MODE)!");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`REVIEW URL (CLICK HERE): ${nodemailer.getTestMessageUrl(info)}`);
    console.log("---------------------------------------------------");

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

module.exports = { sendEmail };
