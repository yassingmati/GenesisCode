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
  // UTILISATION DU DOMAINE VÉRIFIÉ
  // Si from n'est pas spécifié, on utilise le domaine vérifié par défaut
  let fromAddress = from || process.env.EMAIL_FROM || 'GenesisCode <noreply@genesiscode-platform.com>';

  // Si on utilise Resend, on force le domaine vérifié si l'adresse actuelle n'est pas compatible
  if (resend && !fromAddress.includes('genesiscode-platform.com') && !fromAddress.includes('resend.dev')) {
    console.warn(`⚠️ Override: ${fromAddress} n'est pas un domaine vérifié Resend. Utilisation de noreply@genesiscode-platform.com`);
    fromAddress = 'GenesisCode <noreply@genesiscode-platform.com>';
  } else if (!fromAddress.includes('genesiscode-platform.com') && !process.env.EMAIL_FROM) {
    // Fallback générique si aucune config
    fromAddress = 'GenesisCode <onboarding@resend.dev>';
  }

  const replyTo = 'noreply@genesiscode-platform.com';

  if (resend) {
    console.log(`📨 Sending via Resend to ${to} from ${fromAddress}...`);
    try {
      const response = await resend.emails.send({
        from: fromAddress,
        to: to,
        reply_to: replyTo,
        subject: subject,
        html: html
      });

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
 * TEMPLATE EMAIL BASE (Style Premium)
 */
const getBaseEmailTemplate = (title, content, actionUrl = null, actionText = null) => {
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 40px 0; text-align: center; }
          .logo { font-size: 28px; font-weight: 800; color: white; margin: 0; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .content { padding: 40px 32px; color: #334155; }
          .title { color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 20px; margin-top: 0; line-height: 1.3; }
          .text { font-size: 16px; line-height: 1.6; margin-bottom: 32px; color: #475569; }
          .button-container { text-align: center; margin: 32px 0; }
          .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; text-decoration: none; border-radius: 99px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3); transition: all 0.2s; }
          .footer { background-color: #f1f5f9; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer-text { color: #94a3b8; font-size: 12px; line-height: 1.5; margin-bottom: 16px; }
          .social-links { margin-bottom: 20px; }
          .social-link { display: inline-block; margin: 0 8px; text-decoration: none; color: #64748b; font-weight: 600; font-size: 12px; }
          .link-fallback { margin-top: 24px; font-size: 12px; color: #94a3b8; word-break: break-all; border-top: 1px solid #f1f5f9; padding-top: 20px; }
          @media only screen and (max-width: 600px) {
            .container { margin: 0; border-radius: 0; border: none; }
            .content { padding: 32px 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">GenesisCode</div>
          </div>
          <div class="content">
            <h2 class="title">${title}</h2>
            <div class="text">${content}</div>
            
            ${actionUrl ? `
              <div class="button-container">
                <a href="${actionUrl}" class="button">${actionText}</a>
              </div>
              <div class="link-fallback">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br/>
                <a href="${actionUrl}" style="color: #6366f1; text-decoration: none;">${actionUrl}</a>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <div class="social-links">
              <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}" class="social-link">Site Web</a> •
              <a href="#" class="social-link">Support</a> •
              <a href="#" class="social-link">Twitter</a>
            </div>
            <div class="footer-text">
              &copy; ${new Date().getFullYear()} GenesisCode inc. Tous droits réservés.<br/>
              Vous recevez cet email car vous avez créé un compte sur GenesisCode.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
};

/**
 * Envoyer un email de vérification
 */
const sendVerificationEmail = async (email, token) => {
  if (!isEmailConfigured()) {
    throw new Error('Email service not configured.');
  }

  // Sanitize CLIENT_ORIGIN: take the first URL if multiple are comma-separated
  const clientOrigin = (process.env.CLIENT_ORIGIN || 'http://localhost:3000').split(',')[0].trim();
  const verificationLink = `${clientOrigin}/verify-email?token=${token}`;

  const html = getBaseEmailTemplate(
    'Vérifiez votre adresse email',
    'Bienvenue sur GenesisCode ! Pour sécuriser votre compte et accéder à toutes les fonctionnalités, veuillez confirmer votre adresse email.',
    verificationLink,
    'Confirmer mon compte'
  );

  await sendEmail({ to: email, subject: 'Bienvenue sur GenesisCode !', html });
};

/**
 * Envoyer un email de réinitialisation de mot de passe
 */
const sendPasswordResetEmail = async (email, token) => {
  if (!isEmailConfigured()) throw new Error('Email service not configured');

  const resetLink = `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/reset-password?token=${token}`;

  const html = getBaseEmailTemplate(
    'Réinitialisation de mot de passe',
    'Nous avons reçu une demande de réinitialisation pour votre compte GenesisCode. Si vous n\'êtes pas à l\'origine de cette demande, vous pouvez ignorer cet email.',
    resetLink,
    'Réinitialiser le mot de passe'
  );

  await sendEmail({ to: email, subject: 'Réinitialisation mot de passe - GenesisCode', html });
};

/**
 * Envoyer un email de confirmation d'abonnement
 */
const sendSubscriptionConfirmationEmail = async (email, planName, amount, currency) => {
  if (!isEmailConfigured()) return;

  const html = getBaseEmailTemplate(
    'Abonnement Confirmé ! 🚀',
    `Merci de votre confiance. Votre abonnement au plan <strong>${planName}</strong> est maintenant actif. <br/><br/>Montant: <strong>${(amount / 100).toFixed(2)} ${currency}</strong>`,
    `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/dashboard`,
    'Accéder à mon Dashboard'
  );

  try {
    await sendEmail({ to: email, subject: 'Confirmation Abonnement - GenesisCode', html });
  } catch (e) { console.error('Erreur mail abonnement', e); }
};

/**
 * Envoyer un rappel de renouvellement
 */
const sendRenewalReminderEmail = async (email, planName, renewalDate) => {
  if (!isEmailConfigured()) return;

  const dateStr = new Date(renewalDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const html = getBaseEmailTemplate(
    'Renouvellement Prochain',
    `Votre abonnement <strong>${planName}</strong> sera renouvelé automatiquement le <strong>${dateStr}</strong>. Assurez-vous que vos informations de paiement sont à jour.`,
    `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/dashboard/subscription`,
    'Gérer mon abonnement'
  );

  try {
    await sendEmail({ to: email, subject: 'Rappel Renouvellement - GenesisCode', html });
  } catch (e) { console.error('Erreur mail rappel', e); }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSubscriptionConfirmationEmail,
  sendRenewalReminderEmail,
  isEmailConfigured
};