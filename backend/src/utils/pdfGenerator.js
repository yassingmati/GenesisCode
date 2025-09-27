const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { getLocalized } = require('./translationUtils');

exports.generateLevelPDF = async (level, lang) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const filename = `level-${level._id}-${lang}.pdf`;
    const filePath = path.join(__dirname, '../temp', filename);
    const stream = fs.createWriteStream(filePath);
    
    doc.pipe(stream);
    
    // En-tête
    doc.fontSize(18).text(getLocalized(level.title, lang), { align: 'center' });
    doc.moveDown();
    
    // Contenu
    doc.fontSize(12).text(getLocalized(level.content, lang));
    doc.moveDown();
    
    // Pied de page
    doc.fontSize(10)
       .text(`Généré le: ${new Date().toLocaleDateString()}`, 50, doc.page.height - 50);
    
    doc.end();
    
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};