const PDFDocument = require('pdfkit');
const Subscription = require('../models/Subscription');
const fs = require('fs');
const path = require('path');

/**
 * Générer une facture PDF pour un abonnement
 */
exports.generateInvoice = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const userId = req.user.id;

        // Récupérer l'abonnement
        const subscription = await Subscription.findOne({ _id: subscriptionId, user: userId })
            .populate('plan')
            .populate('user');

        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Abonnement introuvable' });
        }

        // Créer un document PDF
        const doc = new PDFDocument({ margin: 50 });

        // Nom du fichier
        const filename = `facture-${subscriptionId}.pdf`;

        // Headers pour le téléchargement
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Pipe le PDF vers la réponse HTTP
        doc.pipe(res);

        // --- Contenu du PDF ---

        // En-tête
        doc
            .fontSize(20)
            .text('CodeGenesis', { align: 'right' })
            .fontSize(10)
            .text('Plateforme d\'apprentissage en ligne', { align: 'right' })
            .moveDown();

        // Titre
        doc
            .fontSize(25)
            .text('FACTURE', { align: 'center' })
            .moveDown();

        // Infos Client & Facture
        const startY = doc.y;

        doc
            .fontSize(12)
            .text(`Facture N°: ${subscription._id.toString().slice(-6).toUpperCase()}`)
            .text(`Date: ${new Date().toLocaleDateString('fr-FR')}`)
            .moveDown()
            .text('Client:')
            .font('Helvetica-Bold')
            .text(`${subscription.user.firstName} ${subscription.user.lastName}`)
            .text(subscription.user.email)
            .font('Helvetica');

        // Tableau Détails
        doc.moveDown(2);
        const tableTop = doc.y;
        const itemCodeX = 50;
        const descriptionX = 150;
        const amountX = 400;

        doc
            .font('Helvetica-Bold')
            .text('Article', itemCodeX, tableTop)
            .text('Description', descriptionX, tableTop)
            .text('Montant', amountX, tableTop);

        doc
            .moveTo(50, tableTop + 15)
            .lineTo(550, tableTop + 15)
            .stroke();

        const itemY = tableTop + 25;
        const planName = subscription.plan ? subscription.plan.name : 'Abonnement';
        const price = subscription.paymentHistory && subscription.paymentHistory.length > 0
            ? subscription.paymentHistory[subscription.paymentHistory.length - 1].amount
            : (subscription.plan ? subscription.plan.priceMonthly : 0);

        const currency = subscription.plan ? subscription.plan.currency : 'TND';

        doc
            .font('Helvetica')
            .text(planName, itemCodeX, itemY)
            .text(`Abonnement mensuel - ${planName}`, descriptionX, itemY)
            .text(`${(price / 100).toFixed(2)} ${currency}`, amountX, itemY);

        // Total
        doc
            .moveTo(50, itemY + 20)
            .lineTo(550, itemY + 20)
            .stroke();

        doc
            .font('Helvetica-Bold')
            .text('Total:', 350, itemY + 30)
            .text(`${(price / 100).toFixed(2)} ${currency}`, amountX, itemY + 30);

        // Footer
        doc
            .fontSize(10)
            .text(
                'Merci de votre confiance.',
                50,
                700,
                { align: 'center', width: 500 }
            );

        // Fin du document
        doc.end();

    } catch (err) {
        console.error('Erreur génération facture:', err);
        res.status(500).json({ success: false, message: 'Erreur lors de la génération de la facture' });
    }
};
