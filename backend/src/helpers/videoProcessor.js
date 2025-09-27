const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

module.exports.optimizeVideo = async (inputPath) => {
  const ext = path.extname(inputPath);
  const outputPath = path.join(
    path.dirname(inputPath),
    `${path.basename(inputPath, ext)}-optimized.mp4`
  );

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-crf 23',
        '-preset fast',
        '-movflags faststart'
      ])
      .on('end', async () => {
        try {
          await fsp.unlink(inputPath);
          resolve(outputPath);
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject)
      .save(outputPath);
  });
};