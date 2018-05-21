const mongoose = require('mongoose');

// SCHEMA SETUP
const storySchema = new mongoose.Schema({
    file: req.file,
    name: String,
    caption: String
});

// module export to be accessed by others
module.exports = mongoose.model("Story", storySchema);