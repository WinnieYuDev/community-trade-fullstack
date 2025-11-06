const mongoose = require("mongoose");

module.exports = mongoose.model("User",
  new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    createdAt: { type: Date, default: Date.now }
  })
);

//Citations:
//Modified code from article: https://www.freecodecamp.org/news/how-to-write-cleaner-code-using-mongoose-schemas/
//Reference code from https://www.mongodb.com/docs/manual/tutorial/model-data-for-application/
//Use of Learning Mode on AI tools to help model schema structure and syntax