const nodemailer = require('nodemailer');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Vérifier si le transporteur est configuré
const isEmailConfigured = () => {
  return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
};

/**
 * Envoyer un email de vérification
 * @param {string} email - Email du destinataire
 * @param {string} token - Token de vérification
 */
const sendVerificationEmail = async (email, token) => {
  if (!isEmailConfigured()) {
    console.warn('⚠️ Email non configuré - EMAIL_USER et EMAIL_PASS requis');
    return;
  }

  const verificationLink = `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Vérification de votre email - CodeGenesis',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4a90e2 0%, #7b61ff 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">CodeGenesis</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Vérification d'email</h2>
          <p style="color: #666; line-height: 1.6;">Merci de vous être inscrit sur notre plateforme. Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
          <p style="margin: 30px 0; text-align: center;">
            <a href="${verificationLink}" 
               style="display: inline-block; padding: 15px 30px; background-color: #4a90e2; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Vérifier mon email
            </a>
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">Si vous n'avez pas créé de compte, veuillez ignorer cet email.</p>
          <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
            Ce lien expirera dans 1 heure.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email de vérification envoyé à:', email);
  } catch (error) {
    console.error('❌ Erreur envoi email de vérification:', error);
    throw error;
  }
};

/**
 * Envoyer un email de réinitialisation de mot de passe
 * @param {string} email - Email du destinataire
 * @param {string} token - Token de réinitialisation
 */
const sendPasswordResetEmail = async (email, token) => {
  if (!isEmailConfigured()) {
    console.warn('⚠️ Email non configuré - EMAIL_USER et EMAIL_PASS requis');
    return;
  }

  const resetLink = `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Réinitialisation de votre mot de passe - CodeGenesis',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4a90e2 0%, #7b61ff 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">CodeGenesis</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Réinitialisation de mot de passe</h2>
          <p style="color: #666; line-height: 1.6;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
          <p style="margin: 30px 0; text-align: center;">
            <a href="${resetLink}" 
               style="display: inline-block; padding: 15px 30px; background-color: #4a90e2; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email. Votre mot de passe ne sera pas modifié.</p>
          <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
            Ce lien expirera dans 1 heure.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email de réinitialisation envoyé à:', email);
  } catch (error) {
    console.error('❌ Erreur envoi email de réinitialisation:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  isEmailConfigured
};