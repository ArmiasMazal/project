// ייבוא המודולים הנדרשים
import express from 'express';
import mysql from 'mysql';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

// הגדרת נתיבים עבור __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// יצירת אפליקציית Express
const app = express();
const port = 3000;

// הגדרת Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static('website')); // הגשת קבצים סטטיים מהתיקייה 'website'

// חיבור למסד הנתונים
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '94199877', 
  database: 'job_site' // שם מסד הנתונים שלך
});

// התחברות למסד הנתונים
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// נתיב לעמוד הראשי
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'login.html'));
});

// הגדרת הנתיב לטיפול בהרשמה
app.post('/sign-up', (req, res) => {
  const { name, email, phone, password, role } = req.body;

  // בדיקת שדות ריקים
  if (!name || !email || !password || !role) {
    return res.status(400).send('Please fill all required fields');
  }

  // בדיקת פורמט אימייל
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return res.status(400).send('Invalid email format');
  }

  // בדיקת אם האימייל כבר קיים
  const checkEmailQuery = 'SELECT email FROM users WHERE email = ?';
  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    if (results.length > 0) {
      return res.status(400).send('Email is already registered');
    }

    // הצפנת הסיסמה
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error encrypting password');
      }

      // הוספת המשתמש למסד הנתונים
      const insertUserQuery = 'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)';
      db.query(insertUserQuery, [name, email, phone, hashedPassword, role], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error registering user');
        }
        res.redirect('/login.html');
      });
    });
  });
});

// הגדרת הנתיב לטיפול בהתחברות
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // בדיקת שדות ריקים
  if (!email || !password) {
    return res.status(400).send('Please enter email and password');
  }

  // השגת המשתמש ממסד הנתונים
  const getUserQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(getUserQuery, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    if (results.length === 0) {
      return res.status(400).send('Email not registered');
    }

    const user = results[0];

    // השוואת הסיסמה
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Server error');
      }
      if (isMatch) {
        // סיסמה נכונה, התחברות מוצלחת
        if (user.role === 'employer') {
          res.redirect('/employer.html');
        } else {
          res.redirect('/jobseeker.html');
        }
      } else {
        res.status(400).send('Incorrect password');
      }
    });
  });
});

// הגדרת הנתיב לטיפול בשכחת הסיסמה
app.post('/forgot-password', (req, res) => {
  const { email, phone } = req.body;

  // בדיקה אם המשתמש קיים על פי האימייל או הטלפון
  const getUserQuery = 'SELECT * FROM users WHERE email = ? OR phone = ?';
  db.query(getUserQuery, [email, phone], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    if (results.length === 0) {
      return res.status(400).send('No user found with provided email or phone');
    }

    // כאן תוכלי לממש לוגיקה לאיפוס סיסמה, כמו שליחת אימייל או SMS
    res.send('Password reset instructions have been sent to your email or phone.');
  });
});

// הפעלת השרת
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
