const mongoose = require('mongoose');

// SCHEMA SETUP
const imageSchema = new mongoose.Schema({
    name: String,
    image: String,
    caption: String
});

// module export to be accessed by others
module.exports = mongoose.model("Image", imageSchema);