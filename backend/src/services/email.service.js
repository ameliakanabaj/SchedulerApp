async function sendEmail(to, subject, htmlContent) {

  console.log("---------------------------------------------------");
  console.log(`EMAIL SENT`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content: ${htmlContent}`);
  console.log("---------------------------------------------------");

  return true;
}

module.exports = { sendEmail };
