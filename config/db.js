const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.connect(process.env.DATABASE_URL);
        console.log('mongodb is connected successfully');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDB;