const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
app.use(bodyParser.json());

app.post('/signup', (req, res) => {
    const { name, email, phone, password, role } = req.body;

    const sql = 'INSERT INTO Users (UserName, PasswordHash, Email, Phone, Role) VALUES (?, ?, ?, ?, ?)';
    const values = [name, password, email, phone, role];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting user data:', err);
            res.status(500).send('Error registering user');
            return;
        }
        res.status(201).send('User registered successfully!');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
