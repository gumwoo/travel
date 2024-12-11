require('dotenv').config();

module.exports = {
    google: {
        placesApiKey: process.env.GOOGLE_PLACES_API_KEY
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY
    }
};