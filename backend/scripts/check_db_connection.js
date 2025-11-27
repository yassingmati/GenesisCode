require('dotenv').config();

const checkConnection = () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.log('MONGODB_URI is not defined in .env');
        return;
    }

    // Mask the password
    const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
    console.log('Current MONGODB_URI:', maskedUri);

    if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
        console.log('WARNING: You are connected to a LOCAL database.');
    } else if (uri.includes('mongodb.net')) {
        console.log('SUCCESS: You are connected to MongoDB ATLAS.');
    } else {
        console.log('Unknown database host.');
    }
};

checkConnection();
