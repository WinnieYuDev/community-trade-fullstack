const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestedItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  offeredItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  message: String,
  status: { type: String, default: 'pending' },
  resolvedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trade', tradeSchema);

//Citations:
//Modified code from article: https://www.freecodecamp.org/news/how-to-write-cleaner-code-using-mongoose-schemas/
//Modified code from https://www.mongodb.com/docs/manual/tutorial/model-data-for-application/
//Use of Learning Mode on AI tools to help model schema structure and syntax