const AWS = require('aws-sdk');
const stream = require('stream');

// Configuration AWS (à mettre dans les variables d'environnement)
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

exports.uploadFileToCloud = async (file, folder) => {
  const pass = new stream.PassThrough();
  pass.end(file.buffer);
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${folder}/${Date.now()}-${file.originalname}`,
    Body: pass,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  try {
    const result = await s3.upload(params).promise();
    return { url: result.Location };
  } catch (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};