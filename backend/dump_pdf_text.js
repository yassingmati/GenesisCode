
const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const pdfPath = path.join(__dirname, 'java (1).pdf');

if (!fs.existsSync(pdfPath)) {
    console.error(`File not found: ${pdfPath}`);
    process.exit(1);
}

const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function (data) {
    console.log('Number of pages:', data.numpages);
    console.log('DATA_START');
    console.log(data.text);
    console.log('DATA_END');
}).catch(err => {
    console.error('Error parsing PDF:', err);
});
