const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  condition: String,  
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: String, 
  image: String,
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', itemSchema);

//Citations:
//Modified code from article: https://www.freecodecamp.org/news/how-to-write-cleaner-code-using-mongoose-schemas/
//Modified code from https://www.mongodb.com/docs/manual/tutorial/model-data-for-application/
//Use of Learning Mode on AI tools to help model schema structure and syntax