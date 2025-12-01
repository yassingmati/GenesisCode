const nodemailer = require('nodemailer');

// Configuration du transporteur email (supporte Gmail ou SMTP générique, avec timeouts/pool)
let transporter = null;
try {
  if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      pool: true,
      maxConnections: Number(process.env.SMTP_MAX_CONNECTIONS) || 2,
      maxMessages: Number(process.env.SMTP_MAX_MESSAGES) || 50,
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS) || 15000,
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS) || 10000,
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS) || 20000,
      requireTLS: String(process.env.SMTP_REQUIRE_TLS || 'true').toLowerCase() === 'true',
      tls: {
        rejectUnauthorized: String(process.env.SMTP_REJECT_UNAUTHORIZED || '').toLowerCase() !== 'false'
      }
    });
  } else {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      pool: true,
      maxConnections: 2,
      maxMessages: 50,
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      requireTLS: true
    });
  }
} catch (e) {
  console.error('❌ Erreur création transporteur email:', e && e.message ? e.message : e);
  transporter = null;
}

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
    console.error('❌ Email non configuré - EMAIL_USER et EMAIL_PASS requis');
    console.error('   EMAIL_USER:', process.env.EMAIL_USER ? 'DÉFINI' : 'NON DÉFINI');
    console.error('   EMAIL_PASS:', process.env.EMAIL_PASS ? 'DÉFINI' : 'NON DÉFINI');
    throw new Error('Email service not configured. EMAIL_USER and EMAIL_PASS environment variables are required.');
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

  if (!transporter) {
    throw new Error('Email transporter not initialized. Check EMAIL_USER and EMAIL_PASS configuration.');
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email de vérification envoyé à:', email);
  } catch (error) {
    console.error('❌ Erreur envoi email de vérification:', error);
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    if (error.response) {
      console.error('   Response:', error.response);
    }
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
    console.error('❌ Email non configuré - EMAIL_USER et EMAIL_PASS requis');
    console.error('   EMAIL_USER:', process.env.EMAIL_USER ? 'DÉFINI' : 'NON DÉFINI');
    console.error('   EMAIL_PASS:', process.env.EMAIL_PASS ? 'DÉFINI' : 'NON DÉFINI');
    throw new Error('Email service not configured. EMAIL_USER and EMAIL_PASS environment variables are required.');
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

  if (!transporter) {
    throw new Error('Email transporter not initialized. Check EMAIL_USER and EMAIL_PASS configuration.');
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email de réinitialisation envoyé à:', email);
  } catch (error) {
    console.error('❌ Erreur envoi email de réinitialisation:', error);
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    if (error.response) {
      console.error('   Response:', error.response);
    }
    throw error;
  }
};

/**
 * Envoyer un email de confirmation d'abonnement
 */
const sendSubscriptionConfirmationEmail = async (email, planName, amount, currency) => {
  if (!isEmailConfigured()) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirmation de votre abonnement - CodeGenesis',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4a90e2 0%, #7b61ff 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">CodeGenesis</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Abonnement Confirmé !</h2>
          <p style="color: #666; line-height: 1.6;">Merci pour votre abonnement au plan <strong>${planName}</strong>.</p>
          <p style="color: #666; line-height: 1.6;">Le montant de <strong>${(amount / 100).toFixed(2)} ${currency}</strong> a été réglé avec succès.</p>
          <p style="margin: 30px 0; text-align: center;">
            <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/subscriptions" 
               style="display: inline-block; padding: 15px 30px; background-color: #4a90e2; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Voir mes abonnements
            </a>
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email confirmation abonnement envoyé à:', email);
  } catch (error) {
    console.error('❌ Erreur envoi email confirmation:', error);
  }
};

/**
 * Envoyer un rappel de renouvellement
 */
const sendRenewalReminderEmail = async (email, planName, renewalDate) => {
  if (!isEmailConfigured()) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Rappel de renouvellement - CodeGenesis',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4a90e2 0%, #7b61ff 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">CodeGenesis</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Renouvellement Prochain</h2>
          <p style="color: #666; line-height: 1.6;">Votre abonnement <strong>${planName}</strong> sera renouvelé automatiquement le <strong>${new Date(renewalDate).toLocaleDateString('fr-FR')}</strong>.</p>
          <p style="color: #666; line-height: 1.6;">Si vous souhaitez annuler, veuillez le faire avant cette date depuis votre espace personnel.</p>
          <p style="margin: 30px 0; text-align: center;">
            <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/subscriptions" 
               style="display: inline-block; padding: 15px 30px; background-color: #4a90e2; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Gérer mon abonnement
            </a>
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email rappel renouvellement envoyé à:', email);
  } catch (error) {
    console.error('❌ Erreur envoi email rappel:', error);
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSubscriptionConfirmationEmail,
  sendRenewalReminderEmail,
  isEmailConfigured
};