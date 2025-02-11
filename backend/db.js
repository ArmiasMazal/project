const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost', // הכתובת של השרת שלך
    user: 'root', // שם המשתמש שלך ב-MySQL
    password: '94199877', // הסיסמה שלך ב-MySQL
    database: 'JobFinderDB' // שם בסיס הנתונים שיצרנו קודם
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL server.');
});

module.exports = connection;
