require('dotenv').config();
const mongoose = require('mongoose');

console.log('URI from env:', process.env.MONGODB_URI ? 'Exists' : 'Missing');

if (process.env.MONGODB_URI) {
    if (process.env.MONGODB_URI.includes('localhost') || process.env.MONGODB_URI.includes('127.0.0.1')) {
        console.log('Target: LOCALHOST');
    } else if (process.env.MONGODB_URI.includes('mongodb.net')) {
        console.log('Target: ATLAS (Cloud)');
    } else {
        console.log('Target: OTHER/UNKNOWN');
    }
} else {
    console.log('Target: NONE');
}
