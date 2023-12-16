const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

// Create an Express application
const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Parse incoming requests with JSON and URL encoding
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up SQLite database
const db = new sqlite3.Database('users.db');

// Create the users table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
`);

// Define routes

// Home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Recipe search endpoint
app.get('/search/:query', async (req, res) => {
    try {
        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${req.params.query}`);
        const recipes = response.data.meals;
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// User registration endpoint
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Insert user into the database
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err) => {
        if (err) {
            console.error('Error registering user:', err.message);
            return res.status(500).send('Error registering user');
        }

        // Retrieve users
        db.all('SELECT * FROM users', (err, rows) => {
            if (err) {
                console.error('Error retrieving users:', err.message);
            } else {
                console.log('Users:', rows);
            }

            console.log('User registered successfully');
            res.redirect('/login');
        });
    });
});

// User login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Retrieve user from the database
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            return res.status(500).send('Error logging in');
        }

        if (!row) {
            return res.sendFile(__dirname + '/public/login.html', { error: 'User not found or incorrect password' });
        }

        res.redirect('/dashboard');
    });
});

// Serve the login form
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// Serve the registration form
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

// Serve the dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/public/dashboard.html');
});

// Handle SIGINT signal to close the database connection
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Closed the database connection.');
        process.exit(0);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
