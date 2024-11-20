import pg from 'pg';
import { run } from './api.js';

const client = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'careercatalyst',
  password: 'root',
  port: 5432,
});

const categories = [
    "Quantitative Aptitude",
    "Logical Reasoning",
    "Verbal Ability",
    "Technical Aptitude",
    "General Knowledge and Current Affairs",
    "Critical Thinking and Problem-Solving",
    "Data Interpretation",
    "Analytical Reasoning",
    "Programming Concepts",
    "Situational Judgement Tests"
];

// Connect to the database
client.connect();

async function getQuestions() {
  try {
    // Query to get data from 'lockques'
    const range = await client.query('SELECT * FROM lockques WHERE id=1;');
    let { low, high } = range.rows[0];
    console.log(low, high);

    // Call the 'run' function to get JSON data for quiz questions
    const quizResult = await run(`
      give me json of quiz questions with 10 questions of aptitude for indian companies inside json format under category ${categories[Math.floor(high / 10)]}
      give me the mixture of hard and medium questions of ${categories[Math.floor(high / 10)]}
    focuse purely on text-based content without requiring image or shape recognition:
      follow this template:
      [
        {
          "question_text": "Question 1",
          "option_1": "Option 1",
          "option_2": "Option 2",
          "option_3": "Option 3",
          "option_4": "Option 4",
          "correct_answer": "A"
        },
        {
          "question_text": "Question 2",
          "option_1": "Option 1",
          "option_2": "Option 2",
          "option_3": "Option 3",
          "option_4": "Option 4",
          "correct_answer": "C"
        },
        {
          "question_text": "Question 3",
          "option_1": "Option 1",
          "option_2": "Option 2",
          "option_3": "Option 3",
          "option_4": "Option 4",
          "correct_answer": "A"
        }
      ]
    `);
    const quizData = JSON.parse(quizResult);

    for (let index = 0; index < quizData.length; index++) {
      const element = quizData[index];
      const questionIndex = low + index;
      if (questionIndex <= high) {
        await client.query(
          `UPDATE quiz
          SET question_text = $1, option_1 = $2, option_2 = $3, option_3 = $4, option_4 = $5, correct_answer = $6
          WHERE question_id = $7;`,
          [
            element.question_text,
            element.option_1,
            element.option_2,
            element.option_3,
            element.option_4,
            element.correct_answer,
            questionIndex
          ]
        );
      }
    }
    low = (low + 10) % 100;
    high = (high + 10 === 100) ? 100 : (high + 10) % 100;
    await client.query(
      `UPDATE lockques
      SET low = $1, high = $2
      WHERE id = 1;`,
      [low, high]
    );

    console.log(quizData[0]);
  } catch (err) {
    
    console.error('Error:', err);
    getQuestions();
  } 
}
getQuestions();
setInterval(getQuestions, 30 * 60 * 1000);