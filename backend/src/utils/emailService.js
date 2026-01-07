const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// Configuration du service email
let transporter = null;
let resend = null;

// Initialisation de Resend (Prioritaire)
if (process.env.RESEND_API_KEY) {
  try {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log('📧 Service Email initialisé avec Resend API');
  } catch (error) {
    console.error('❌ Erreur initialisation Resend:', error.message);
  }
}

// Initialisation de Nodemailer (Fallback ou Local)
if (!resend) {
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log('📧 Initializing SMTP Transport with Custom Config:');
      console.log(`   Host: ${process.env.SMTP_HOST}`);
      console.log(`   Port: ${process.env.SMTP_PORT}`);

      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: { rejectUnauthorized: false }
      });
    } else {
      console.log('⚠️ Missing SMTP env vars, falling back to basic Gmail service for development');
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
  } catch (e) {
    console.error('❌ Erreur création transporteur email:', e && e.message ? e.message : e);
    transporter = null;
  }
}

// Vérifier si un service est configuré
const isEmailConfigured = () => {
  return !!(resend || (process.env.SMTP_USER && process.env.SMTP_PASS) || (process.env.EMAIL_USER && process.env.EMAIL_PASS));
};

/**
 * Helper générique pour envoyer un email
 */
const sendEmail = async ({ to, subject, html, from }) => {
  let fromAddress = from || process.env.EMAIL_FROM || 'onboarding@resend.dev'; // Resend Default
  // Determine Reply-To using the *intended* from address (which might be the gmail one)
  const replyTo = fromAddress.includes('@') ? fromAddress : 'noreply.genesiscode@gmail.com';

  if (resend) {
    // Resend interdit les adresses @gmail.com ou yahoo etc. en expéditeur
    if (fromAddress.includes('@gmail.com') || fromAddress.includes('@yahoo') || fromAddress.includes('@hotmail')) {
      console.warn(`⚠️ Attention: Resend interdit l'envoi depuis ${fromAddress}. Utilisation de onboarding@resend.dev à la place.`);
      // Use friendly name with the allowed email
      fromAddress = 'GenesisCode <onboarding@resend.dev>';
    }

    console.log(`📨 Sending via Resend to ${to} from ${fromAddress} (Reply-To: ${replyTo})...`);
    try {
      const response = await resend.emails.send({
        from: fromAddress,
        to: to,
        reply_to: replyTo,
        subject: subject,
        html: html
      });

      // Resend ne throw pas d'erreur, il renvoie un objet avec error
      if (response.error) {
        console.error('❌ Erreur API Resend:', response.error);
        throw new Error(`Resend Error: ${response.error.message}`);
      }

      console.log('✅ Email envoyé avec succès via Resend:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur critique envoi Resend:', error);
      throw error;
    }
  }

  if (transporter) {
    console.log(`📨 Sending via SMTP to ${to}...`);
    const mailOptions = {
      from: fromAddress,
      to: to,
      replyTo: replyTo,
      subject: subject,
      html: html
    };
    return await transporter.sendMail(mailOptions);
  }

  throw new Error('Aucun service email configuré');
};

/**
 * Envoyer un email de vérification
 */
const sendVerificationEmail = async (email, token) => {
  if (!isEmailConfigured()) {
    throw new Error('Email service not configured.');
  }

  const verificationLink = `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/verify-email?token=${token}`;

  const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">GenesisCode</h1>
        </div>
        <div style="padding: 40px 30px; background-color: #ffffff;">
          <h2 style="color: #1e293b; text-align: center;">Vérifiez votre email</h2>
          <p style="color: #475569; text-align: center;">Merci de vous être inscrit sur GenesisCode ! Cliquez ci-dessous pour vérifier votre compte.</p>
          <div style="text-align: center; margin: 35px 0;">
            <a href="${verificationLink}" 
               style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: 600;">
              Vérifier mon email
            </a>
          </div>
          <p style="text-align: center; font-size: 12px; color: #94a3b8;">Si le bouton ne marche pas : ${verificationLink}</p>
        </div>
      </div>
  `;

  await sendEmail({ to: email, subject: 'Vérification de votre email - GenesisCode', html });
};

/**
 * Envoyer un email de réinitialisation de mot de passe
 */
const sendPasswordResetEmail = async (email, token) => {
  if (!isEmailConfigured()) throw new Error('Email service not configured');

  const resetLink = `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/reset-password?token=${token}`;

  const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4a90e2 0%, #7b61ff 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">CodeGenesis</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Réinitialisation de mot de passe</h2>
          <p style="margin: 30px 0; text-align: center;">
            <a href="${resetLink}" 
               style="display: inline-block; padding: 15px 30px; background-color: #4a90e2; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Réinitialiser mon mot de passe
            </a>
          </p>
        </div>
      </div>
  `;

  await sendEmail({ to: email, subject: 'Réinitialisation de votre mot de passe - GenesisCode', html });
};

/**
 * Envoyer un email de confirmation d'abonnement
 */
const sendSubscriptionConfirmationEmail = async (email, planName, amount, currency) => {
  if (!isEmailConfigured()) return;
  const html = `<h2>Abonnement Confirmé !</h2><p>Merci pour votre abonnement au plan <strong>${planName}</strong> (${(amount / 100).toFixed(2)} ${currency}).</p>`;
  try {
    await sendEmail({ to: email, subject: 'Confirmation de votre abonnement - GenesisCode', html });
  } catch (e) { console.error('Erreur mail abonnement', e); }
};

/**
 * Envoyer un rappel de renouvellement
 */
const sendRenewalReminderEmail = async (email, planName, renewalDate) => {
  if (!isEmailConfigured()) return;
  const html = `<h2>Renouvellement Prochain</h2><p>Votre abonnement <strong>${planName}</strong> sera renouvelé le ${new Date(renewalDate).toLocaleDateString()}.</p>`;
  try {
    await sendEmail({ to: email, subject: 'Rappel de renouvellement - GenesisCode', html });
  } catch (e) { console.error('Erreur mail rappel', e); }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSubscriptionConfirmationEmail,
  sendRenewalReminderEmail,
  isEmailConfigured
};