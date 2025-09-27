const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, token) => {
const verificationLink = `${process.env.SERVER_URL}/api/auth/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Vérification de votre email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3498db;">Vérification d'email</h2>
        <p>Merci de vous être inscrit sur notre plateforme. Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
        <p style="margin: 20px 0;">
          <a href="${verificationLink}" 
             style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px;">
            Vérifier mon email
          </a>
        </p>
        <p>Si vous n'avez pas créé de compte, veuillez ignorer cet email.</p>
        <p style="font-size: 12px; color: #777; margin-top: 30px;">
          Ce lien expirera dans 1 heure.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;