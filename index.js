import express from 'express';
import bodyParser from 'body-parser';
import { spawn } from 'child_process';
import { Salary, bard, job_d, career1, resume, news, run } from './api.js';
import fs from 'fs';
import { generateBeautifulResume } from './functions.js';
import { marked } from 'marked';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const app = express();
const port = 3000;

const client = new pg.Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false, // Disable SSL verification
    ca: process.env.DB_SSL_CERT,
  },
});


// Connect to the database
client.connect((err) => {
  if (err) {
    console.error('Failed to connect to the database:', err.stack);
  } else {
    console.log('Connected to the database successfully.');
  }
});

// Middleware
app.use(express.static('public'));
app.use(express.static('views'));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => res.render('home.ejs'));
app.get('/job_finder', (req, res) => res.render('job_finder.ejs'));
app.get('/career', (req, res) => res.render('career.ejs'));
app.get('/get_resume', (req, res) => res.render('get_resume.ejs'));
app.get('/skill_details', (req, res) => res.render('skill_details.ejs'));
app.get('/job_discription', (req, res) => res.render('job_discription.ejs'));

// Resume generator
app.post('/get_resume', async (req, res) => {
  try {
    const filteredBody = Object.fromEntries(
      Object.entries(req.body).filter(([_, value]) => value.trim())
    );

    await generateBeautifulResume(filteredBody, './public/resume.pdf');
    res.render('resume.ejs');
  } catch (err) {
    console.error('Error generating or downloading resume:', err);
    res.status(500).send('Error generating or downloading resume');
  }
});

// News API
app.post('/home', async (req, res) => {
  try {
    const new_s = news(req.body.username);
    res.send(new_s);
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).send('Error fetching news');
  }
});

// Job description
app.post('/job_discription', async (req, res) => {
  try {
    const result = JSON.parse(await Salary(req.body.only_job));
    res.render('job_discription.ejs', { result });
  } catch (err) {
    console.error('Error fetching job description:', err);
    res.status(500).send('Error fetching job description');
  }
});

// Career advice
app.post('/career', async (req, res) => {
  try {
    const result = marked(await career1(req.body.Details, req.body.c_education));
    fs.writeFileSync('views/careerinfo.ejs', result, { encoding: 'utf-8' });
    res.render('career.ejs', { result });
  } catch (err) {
    console.error('Error fetching career advice:', err);
    res.status(500).send('Error fetching career advice');
  }
});

// Quiz
app.get('/quiz', async (req, res) => {
  const range = await client.query('SELECT * FROM lockques WHERE id=1;');
  const { low, high } = range.rows[0];
  const result = await client.query(
    'SELECT * FROM quiz WHERE question_id NOT BETWEEN $1 AND $2;',
    [low, high]
  );
  res.render('quiz.ejs', { questions: shuffleArray(result.rows).slice(0, 20) });
});

// Quiz result
app.post('/submit-quiz', async (req, res) => {
  const userAnswers = req.body;
  let count = 0;
  const wrong = [];

  for (const key in userAnswers) {
    const correct = await client.query(
      'SELECT CASE WHEN correct_answer = $1 THEN 1 ELSE 0 END AS result FROM quiz WHERE question_id = $2',
      [userAnswers[key], key]
    );
    count += correct.rows[0].result;
    if (!correct.rows[0].result) wrong.push(key);
  }

  res.render('quizResult.ejs', { count, wrong });
});
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Start server
app.listen(port, () => console.log(`App is running on port ${port}`));
