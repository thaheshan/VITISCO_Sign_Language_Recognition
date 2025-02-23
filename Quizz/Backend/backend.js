// Import Express library
const express = require('express');
const app = express();

// Middleware to handle JSON requests
app.use(express.json());

// Define a simple GET route
app.get('/', (req, res) => {
  res.send('this is the basic backend code for the quizz ');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
