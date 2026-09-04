const express = require('express');
const userService = require('./user'); 
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

//CORS middleware
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully');
 
  server.close(async () => {
    try {
      //await pool.end();
      await userService.pool.end();
      console.log('Database pool closed');
    } catch (err) {
      console.error('Error closing pool:', err.message);
    } finally {
      process.exit(0);    // always exit 0 — this was a clean shutdown request
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Test API
app.get('/test', (req, res) => {
  try {
    res.status(200).json({ message: 'API is working' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by id
app.get('/users/:id', async (req, res) => {
  try {
    const user = await userService.getUserById(parseInt(req.params.id, 10));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create user
app.post('/users', async (req, res) => {
  try {
    const user = await userService.createUser(req.body.name, req.body.email);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user
app.put('/users/:id', async (req, res) => {
  try {
    const user = await userService.updateUser(
      parseInt(req.params.id, 10),
      req.body.name,
      req.body.email
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
app.delete('/users/:id', async (req, res) => {
  try {
    const user = await userService.deleteUser(parseInt(req.params.id, 10));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});