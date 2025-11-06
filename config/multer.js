const multer = require("multer");
const path = require("path");

// storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // save to /uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // timestamp-filename
  }
});

// only allow images
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  cb(null, allowed.includes(file.mimetype));
};

module.exports = multer({ storage, fileFilter });

//Citations:
//Modified code from youtube tutorial: https://www.youtube.com/watch?v=z5UgtXOxEEk
//Reference code from multer tutorial: https://expressjs.com/en/resources/middleware/multer.html
//Use of dotenv package to hide sensitive info: https://www.npmjs.com/package/dotenv
//Referenced code from on AI tools to help with multer set up  