const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for local development (optional)
app.use(cors());
app.use(bodyParser.json());

/*
  In‑memory auction data for demonstration purposes. In a real application
  these would be fetched from a database. The objects contain the fields
  expected by the front‑end: title, bid and deadline. Modify or extend
  these arrays as needed.
*/
let trendingAuctions = [
  { title: 'Basketball Rookie Card', bid: '$2,750', deadline: '2025-08-01T20:00:00' },
  { title: 'Sports Card Collection Lot', bid: '$1,150', deadline: '2025-08-03T14:30:00' },
  { title: 'Memorabilia Bundle', bid: '$3,600', deadline: '2025-08-05T09:00:00' },
];
let featuredAuctions = [
  { title: 'Vintage Auctioneer Gavel', bid: '$1,350', deadline: '2025-08-10T12:00:00' },
  { title: 'Signed Basketball', bid: '$2,900', deadline: '2025-08-12T17:30:00' },
  { title: 'Autographed Baseball Collection', bid: '$3,250', deadline: '2025-08-14T15:45:00' },
];

// API route to get trending auctions
app.get('/api/auctions/trending', (req, res) => {
  res.json(trendingAuctions);
});

// API route to get featured auctions
app.get('/api/auctions/featured', (req, res) => {
  res.json(featuredAuctions);
});

// API route to add a new auction (very basic). In a real app you would
// validate the input and store it in a database. This endpoint expects
// { section: 'trending' | 'featured', title: string, bid: string, deadline: string }
app.post('/api/auctions', (req, res) => {
  const { section, title, bid, deadline } = req.body;
  if (!section || !title || !bid || !deadline) {
    return res.status(400).json({ error: 'Missing fields' });
    }
  const newAuction = { title, bid, deadline };
  if (section === 'trending') {
    trendingAuctions.push(newAuction);
  } else if (section === 'featured') {
    featuredAuctions.push(newAuction);
  } else {
    return res.status(400).json({ error: 'Invalid section' });
  }
  res.json({ message: 'Auction added', auction: newAuction });
});

// API route for signup (dummy implementation). In a real application you
// would store the user credentials securely and handle password hashing,
// email verification, etc.
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email and password' });
  }
  // For demonstration we simply respond with success and echo the user info
  res.json({ message: 'Signup successful', user: { name, email } });
});

// Serve static files from the "website" directory
app.use(express.static(path.join(__dirname, 'website')));

// For any other request, serve the index file (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MVP Auctions server running on port ${PORT}`);
});