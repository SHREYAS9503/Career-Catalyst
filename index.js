// server.mjs
import express from 'express';
import bodyParser from 'body-parser';
import { spawn } from 'child_process';
import { Salary, bard, job_d, career1, resume, news,run} from './api.js';
import fs from 'fs';
import {generateBeautifulResume} from './functions.js';
import { marked } from 'marked';
import pg from 'pg';


const app = express();
const port = 10000;

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
app.use(express.static("public"));
app.use(express.static('views'));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.render("home.ejs");
});

app.get('/job_finder', (req, res) => {
  res.render("job_finder.ejs");
});

app.get('/career', (req, res) => {
  res.render("career.ejs");
});

app.get('/get_resume', (req, res) => {
  res.render("get_resume.ejs");
});

app.get('/skill_details', (req, res) => {
  res.render("skill_details.ejs");
});

app.get('/job_discription', (req, res) => {
  res.render("job_discription.ejs");
});

// Function to convert text file to PDF


// POST endpoint to generate resume and download as PDF
// POST endpoint to generate resume and download as PDF
app.post('/get_resume', async (req, res) => {
  try {
    console.log(req.body)
    let na = [];
    
    // Filter out empty fields
    for (const key in req.body) {
      if (req.body[key] === "") {
        na.push(key);
      }
    }
    na.forEach(key => {
      delete req.body[key];
    });
    // Generate resume content
    // const result = await resume(JSON.stringify(req.body));
    // console.log(result)
    
    // Write resume content to a text file
    
    await generateBeautifulResume(req.body, './public/resume.pdf');

    res.render('resume.ejs');
  } catch (err) {
    console.error('Error generating or downloading resume:', err);
    res.status(500).send('Error generating or downloading resume');
  }
});



// POST endpoint to fetch news based on user input
app.post('/home', async (req, res) => {
  try {
    const data = req.body.username;
    const new_s = news(data);
    res.send(new_s);
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).send('Error fetching news');
  }
});

// POST endpoint for job description
app.post('/job_discription', async (req, res) => {
  try {
    const d_job = req.body.only_job;
    const s_range = await Salary(d_job);
    let result= JSON.parse(s_range);

    console.log(result);

    res.render('job_discription.ejs', { result});
  } catch (err) {
    console.error('Error fetching job description:', err);
    res.status(500).send('Error fetching job description');
  }
});

// POST endpoint for career advice
app.post('/career', async (req, res) => {
  try {
    const user_interest = req.body.Details;
    const user_education = req.body.c_education;
    let result = await career1(user_interest, user_education);
    result=marked(result)
    await fs.writeFileSync('views/careerinfo.ejs', result, { encoding: 'utf-8' });
    res.render('career.ejs', { result });
  } catch (err) {
    console.error('Error fetching career advice:', err);
    res.status(500).send('Error fetching career advice');
  }
});

// POST endpoint for job finding
app.post('/job_finder', async (req, res) => {
  try {
    const user_text = req.body.Details;
    await runPythonScript(user_text)
      .then((result) => {
        res.render('job_finder.ejs', { result });
      })
      .catch((err) => {
        console.error('Error running Python script:', err);
        res.status(500).send('Error running Python script');
      });
  } catch (err) {
    console.error('Error processing job finder:', err);
    res.status(500).send('Error processing job finder');
  }
});

let quiz;

app.get("/quiz", async(req, res) => {
  const range = await client.query('SELECT * FROM lockques WHERE id=1;');
    const { low, high } = range.rows[0];
  let result = await client.query('SELECT * FROM quiz WHERE question_id NOT BETWEEN $1 AND $2;' , [low, high]);  
result=shuffleArray(result.rows)
    res.render('quiz.ejs', { questions: (result.slice(0,20)) });
});



app.post('/submit-quiz', async(req, res) => {
 let count =0;
 let wrong=[];
  const userAnswers = req.body;
  console.log(userAnswers);
  for (let key in userAnswers){
console.log((+key), userAnswers[key]);
const result = await client.query(
  `SELECT 
      CASE 
          WHEN correct_answer = $1 THEN 1
          ELSE 0
      END AS result
   FROM quiz
   WHERE question_id = $2;`,
  [userAnswers[key], +key]
);
if(result.rows[0].result == 1){
  count++;
}else{
  const wrongans=await client.query(`select * from quiz where question_id = $1`,[+key]);
  wrong.push(wrongans.rows[0]);
  }
}
console.log(wrong);
  res.render('resultanalysis.ejs', { wrong, count });
  
});

// Function to run Python script with user skills
function runPythonScript(userSkills) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['./ml/recommendation_script.py', userSkills]);
    pythonProcess.stdout.on('data', (data) => {
      resolve(data.toString());
    });
    pythonProcess.on('error', (error) => {

      reject(error);
    });
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(`Python process exited with code ${code}`);
      }
    });
  });
}

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
