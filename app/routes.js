// require necessary modules =====================================================
const mongoose = require('mongoose');
const Item = require('./models/Item');
const Trade = require('./models/Trade');
const User = require('./models/User');
const multer = require('../config/multer'); // file upload config
const expressSession = require('express-session');

// export routes function =====================================================
module.exports = function(app, passport) {

  // middleware: check login ============================
  const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
  };

  // session setup =====================================================
  app.use(expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));

  // HOMEPAGE — List all community items =====================================================
  app.get('/', async (req, res) => {
    try {
      const items = await Item.find()
        .populate('owner')
        .populate('comments.user');
      res.render('index', { user: req.user, items });
    } catch (err) {
      console.error(err);
      res.send('Error loading community items');
    }
  });

  // signup =====================================================
  app.get('/signup', (req, res) => {
    res.render('signup', { msg: req.flash('signupMessage') });
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  // login =====================================================
  app.get('/login', (req, res) => {
    res.render('login', { msg: req.flash('loginMessage') });
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }));

  // logout routes =====================================================
  app.get('/logout', (req, res) => {
    req.logout(() => {
      console.log('User logged out');
    });
    res.redirect('/');
  });

  // create items routes =====================================================
  app.get('/item/new', isLoggedIn, (req, res) => {
    res.render('item_form');
  });

  app.post('/item', isLoggedIn, multer.single('image'), async (req, res) => {
    try {
      await Item.create({
        title: req.body.title,
        description: req.body.description,
        condition: req.body.condition,
        location: req.body.location,
        owner: req.user._id,
        image: req.file ? '/uploads/' + req.file.filename : null
      });
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.send('Error creating item');
    }
  });

  // comment post =====================================================
  app.post('/item/:id/comment', isLoggedIn, async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);
      if (!item) return res.json({ error: 'Item not found' });

      const comment = {
        user: req.user._id,
        message: req.body.message,
        createdAt: new Date()
      };

      item.comments.push(comment);
      await item.save();
      await item.populate('comments.user');

      res.json({
        success: true,
        user: req.user.name || req.user.email,
        message: req.body.message
      });
    } catch (err) {
      console.error(err);
      res.json({ error: 'Error adding comment' });
    }
  });

  // profile pages - user items and trade status =====================================================
  app.get('/profile', isLoggedIn, async (req, res) => {
    try {
      const myItems = await Item.find({ owner: req.user._id }).lean();

      const incomingRaw = await Trade.find({ toUser: req.user._id })
        .populate('fromUser requestedItem offeredItem')
        .lean();

      const outgoing = await Trade.find({ fromUser: req.user._id })
        .populate('toUser requestedItem offeredItem')
        .lean();

      const incoming = incomingRaw.filter(t => t.requestedItem !== null);

      res.render('profile', { user: req.user, myItems, incoming, outgoing });
    } catch (err) {
      console.error(err);
      res.send('Error loading profile');
    }
  });

  // trade routes  =====================================================

  // send trade request ================================
  app.post('/trades', isLoggedIn, async (req, res) => {
    try {
      const { requestedItemId, offeredItemId, message } = req.body;
      const requested = await Item.findById(requestedItemId);

      if (!requested) return res.json({ error: 'Item not found' });
      if (String(requested.owner) === String(req.user._id))
        return res.json({ error: 'Cannot trade for your own item' });

      const trade = await Trade.create({
        fromUser: req.user._id,
        toUser: requested.owner,
        requestedItem: requestedItemId,
        offeredItem: offeredItemId || null,
        message,
        status: 'pending'
      });

      res.json({ success: true, trade });
    } catch (err) {
      console.error(err);
      res.json({ error: 'Server error' });
    }
  });

  // accept trade =====================================
  app.put('/trades/:id/accept', isLoggedIn, async (req, res) => {
    try {
      const trade = await Trade.findById(req.params.id)
        .populate('requestedItem offeredItem');

      if (!trade) return res.json({ error: 'Trade not found' });
      if (String(trade.toUser) !== String(req.user._id))
        return res.json({ error: 'Not authorized' });

      trade.status = 'accepted';
      trade.resolvedAt = new Date();

      if (trade.requestedItem) {
        trade.requestedItem.available = false;
        await trade.requestedItem.save();
      }

      if (trade.offeredItem) {
        trade.offeredItem.available = false;
        await trade.offeredItem.save();
      }

      await trade.save();
      res.json({ success: true });
    } catch (err) {
      res.json({ error: 'Error accepting trade' });
    }
  });

  // reject trade =====================================
  app.put('/trades/:id/reject', isLoggedIn, async (req, res) => {
    try {
      const trade = await Trade.findById(req.params.id);
      if (!trade) return res.json({ error: 'Trade not found' });

      trade.status = 'rejected';
      trade.resolvedAt = new Date();
      await trade.save();

      res.json({ success: true });
    } catch (err) {
      res.json({ error: 'Error rejecting trade' });
    }
  });

  // delete trade =====================================
  app.delete('/trades/:id', isLoggedIn, async (req, res) => {
    try {
      const trade = await Trade.findById(req.params.id);
      if (!trade) return res.json({ error: 'Trade not found' });

      if (trade.status === 'pending')
        return res.json({ error: 'Cannot delete a pending trade' });

      if (
        String(trade.fromUser) !== String(req.user._id) &&
        String(trade.toUser) !== String(req.user._id)
      ) {
        return res.json({ error: 'Not authorized' });
      }

      await trade.deleteOne();
      res.json({ success: true });
    } catch (err) {
      res.json({ error: 'Server error' });
    }
  });

  // delete item =====================================================
  app.delete('/items', isLoggedIn, async (req, res) => {
    try {
      const item = await Item.findById(req.body._id);
      if (!item) return res.json({ error: 'Item not found' });
      if (String(item.owner) !== String(req.user._id))
        return res.json({ error: 'Unauthorized' });

      await item.deleteOne();
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.json({ error: 'Server error' });
    }
  });

  // resources page, hard-coded at the moment =====================================================
  app.get('/resources', async (req, res) => {
    const user = req.user || null;

    const foodPantries = [
      { name: 'Greater Boston Food Bank', address: '70 South Bay Ave, Boston, MA', phone: '617-427-5200' },
      { name: "Rosie's Place", address: '889 Harrison Ave, Boston, MA', phone: '617-442-9322' },
      { name: 'Boston Rescue Mission', address: '39 Kingston St, Boston, MA', phone: '617-338-9000' },
      { name: 'St. Francis House', address: '39 Boylston St, Boston, MA', phone: '617-542-4211' }
    ];

    const libraries = [
      { name: 'Boston Public Library – Central Library', address: '700 Boylston St, Boston, MA', phone: '617-536-5400' },
      { name: 'Boston Public Library – South End Branch', address: '685 Tremont St, Boston, MA', phone: '617-536-7150' },
      { name: 'Boston Public Library – Chinatown Branch', address: '690 Washington St, Boston, MA', phone: '617-536-8140' },
      { name: 'East Boston Branch Library', address: '365 Bremen St, Boston, MA', phone: '617-569-6080' }
    ];

    res.render('resources', { user, foodPantries, libraries });
  });

};

// Citations:
// Modified code from YouTube tutorial: https://www.youtube.com/watch?v=z5UgtXOxEEk
// Reference code from https://www.mongodb.com/resources/languages/express-mongodb-rest-api-tutorial#setting-up-the-project
// Use of dotenv package to hide sensitive info: https://www.npmjs.com/package/dotenv
// Use of Learning Mode on AI tools to help with code structure, syntax, and debugging
