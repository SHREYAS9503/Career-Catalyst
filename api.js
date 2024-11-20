import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";
import {filter,filter2} from "./filter.js";
import axios from 'axios';
import fs from 'fs';


// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function bard(user_text) {
  // For text-only input, use the gemini-pro model
 
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Given a block of text {${user_text}} describing someone's skills for a job application, extract and rank only the skills explicitly mentioned in the text.includes both soft skills and technical skills mentioned in the given text . Rank the skills with soft skills appearing first. The output should be a simple list (array) containing only the extracted and ranked skill names.`
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return filter(text)
}
async function run(prompt) {
  // For text-only input, use the gemini-pro model
 
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return filter(text);
}

async function job_d(user_text) {
 
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `give a brief discription about this task that are performed in ${user_text} profession in paragraph conating all aspects in about 50 words`
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return filter(text)
}

async function resume(details) {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Regenerate the code for the given ${details} using the template from ${fs.readFileSync('functions.js', 'utf-8')}:
add sentence casing like upper case and lower case properly
Do not add any images.
Use only the provided ${details}; do not use details from the template.
Correct grammar and spelling mistakes; rephrase text if needed.
Use the template as a reference to create a proffesional one-page resume.
Enhance the UI of the resume generator for better presentation.
Ensure the content fits on one page
and comply with ats standards
do not miss the export statement {generateBeautifulResume(resumeDetails, './public/resume.pdf');

const generateResume = () => {
  generateBeautifulResume(resumeDetails, './public/resume.pdf');
};

export {generateResume};}this one
  `
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return (filter(text))
}

async function career1( user_interest,user_education ) {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = ` A user is highly interested in learning about ${user_interest}. They are considering studying ${user_education} in college. Suggest relevant career paths that would allow them to explore this interest and potentially utilize the knowledge gained through their studies.your answer should be in de form for better understanding`
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return (text)
}
async function news(data) {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `give me 6  latest trending news on ${data}`
  const result = await model.generateContent(prompt);
  const response = await result.response;
 
  return filter(response)
}

// salaryEstimation.js


async function Salary(d_job) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `I want the information and also some links for the job openings of the ${d_job} in json format
  {
  "job_details": {
    "title": "Job Title",
    "description": "Brief description of the job role, responsibilities, and requirements.",
    "skills_required": ["Skill1", "Skill2", "Skill3"]
  },
  "result": {
    "mean_salary": "Average salary (e.g., ₹X per annum)",
    "median_salary": "Median salary (e.g., ₹Y per annum)",
    "max_salary": "Maximum salary (e.g., ₹Z per annum)",
    "salary_period": "Period for the salary (e.g., per annum, per month)",
    "currency": "INR"
  },
  "companies_hiring": [
    "https://link-to-job-listing1.com",
    "https://link-to-job-listing2.com",
    "https://link-to-job-listing3.com"
  ]
}
Note:
links should be original it should for indian region
`
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = filter(response.text());
  
  return (text)
}



export { bard,Salary,job_d,career1,resume, news,run}
