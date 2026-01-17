const sharp = require('sharp');
// pixelmatch is imported dynamically because it is an ESM module

class AIService {
    constructor() {
        // No API key needed for local comparison
    }

    /**
     * Compare user screenshot with solution image using local pixel comparison (Sharp + Pixelmatch)
     * @param {string} userImageBase64 - Base64 string of the user's screenshot
     * @param {string} solutionImageUrl - URL/Path to the solution image
     * @returns {Promise<{score: number, feedback: string}>}
     */
    async compareVisuals(userImageBase64, solutionImageUrl) {
        try {
            console.log(`[AIService] Local Comparison Request. Solution: ${solutionImageUrl}`);

            // 1. Prepare User Buffer
            const base64Data = userImageBase64.replace(/^data:image\/\w+;base64,/, "");
            const userBuffer = Buffer.from(base64Data, 'base64');

            // 2. Prepare Solution Buffer
            let targetUrl = solutionImageUrl;
            if (targetUrl && (targetUrl.startsWith('/') || !targetUrl.startsWith('http'))) {
                const baseUrl = process.env.SERVER_URL || 'http://localhost:5000';
                targetUrl = `${baseUrl}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
            }

            let solutionBuffer;
            if (targetUrl && targetUrl.startsWith('http')) {
                const fetch = globalThis.fetch || require('node-fetch');
                try {
                    const response = await fetch(targetUrl, {
                        timeout: 5000,
                        headers: { 'User-Agent': 'GenesisCode-Backend/1.0' }
                    });
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    solutionBuffer = await response.arrayBuffer();
                    solutionBuffer = Buffer.from(solutionBuffer);
                } catch (err) {
                    console.error(`[AIService] Fetch Error: ${err.message}`);
                    return { score: 0, feedback: `Erreur: Impossible de télécharger l'image solution.` };
                }
            } else {
                return { score: 0, feedback: "Erreur interne: Image solution inaccessible." };
            }

            // 3. Normalize Images using Sharp
            // We resize user image to match solution image dimensions for pixel comparison
            const solutionImage = sharp(solutionBuffer);
            const solutionMeta = await solutionImage.metadata();
            const { width, height } = solutionMeta;

            // Get raw pixel data for solution
            const { data: img2Raw } = await solutionImage
                .ensureAlpha()
                .resize(width, height) // Ensure consistent size if metadata differed slightly
                .raw()
                .toBuffer({ resolveWithObject: true });

            // Resize user image to exactly match solution
            const { data: img1Raw } = await sharp(userBuffer)
                .ensureAlpha()
                .resize(width, height, { fit: 'fill' }) // Stretch to fit if needed, or 'cover'
                .raw()
                .toBuffer({ resolveWithObject: true });

            // 4. Compare pixels
            const { default: pixelmatch } = await import('pixelmatch');
            const diffPixels = pixelmatch(img1Raw, img2Raw, null, width, height, { threshold: 0.1 });
            const totalPixels = width * height;
            const matchRatio = 1 - (diffPixels / totalPixels);
            const score = Math.round(matchRatio * 100);

            console.log(`[AIService] Local Score: ${score}% (Diff: ${diffPixels}/${totalPixels})`);

            let feedback = "";
            if (score >= 80) {
                feedback = `Excellent ! Le résultat visuel est conforme (${score}% de similarité).`;
            } else if (score >= 50) {
                feedback = `Pas mal, mais il y a des différences visuelles importantes (${score}%). Vérifiez les couleurs et positions.`;
            } else {
                feedback = `Le résultat est trop différent de l'attendu (${score}%).`;
            }

            return { score, feedback };

        } catch (error) {
            console.error("Local Comparison Error:", error);
            return { score: 0, feedback: `Erreur interne lors de la comparaison: ${error.message}` };
        }
    }
}

module.exports = new AIService();
