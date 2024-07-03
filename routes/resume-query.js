const express = require('express');
const router = express.Router();
const pdfParse = require('pdf-parse');
require('dotenv').config();
// const PDF = require('../models/pdfdetails');


const API_KEY = process.env.GEMINI_API_KEY;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});


const removeAsterisks = (text) => {
    return text.replace(/\*/g, '');
}

function formatTextWithBulletsAndIndentation(text) {
  const splitText = text.split(/(:)/);
  let result = [];
  for (let i = 0; i < splitText.length; i++) {
    const item = splitText[i].trim();
    if (item) {
      if (item === ":") {
        result.push(":\n\t");
      } 
      else {
        if (i === 0 || splitText[i - 1] === ":") {
          result.push(`• ${item}`);
        } else {
          result.push(item);
        }
      }
    }
  }
  return result.join('');
}

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/resume-check', upload.single("file"), async (req, res) => {
    try{
      const dataBuffer = req.file.buffer;
      const pdfData = await pdfParse(dataBuffer);
      const text = pdfData.text;
      const fileName = req.file.originalname;
      const requirements = req.body.requirements;
      const prompt = `Analyze this resume and state in yes or no if the candidate is eligible for a job requiring skills like ${requirements} \n\n${text}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const respText = response.text();
      res.json({
        status: 'success',
        pdf: fileName,
        answer: formatTextWithBulletsAndIndentation(removeAsterisks(respText))
      });
    } catch (error){
        console.error(error);
        res.status(500).json({ error: 'Error processing PDF or querying Gemini' });
    } 
});


router.post('/resume-query', upload.single("file"), async (req, res) => {
  try{
    const dataBuffer = req.file.buffer;
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    const fileName = req.file.originalname;
    const query = req.body.query;
    const prompt = `Analyze the following resume and answer in short the query ${query} \n\n${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const respText = response.text();

    res.json({
      status: 'success',
      pdf: fileName,
      answer: formatTextWithBulletsAndIndentation(removeAsterisks(respText))
    });
  } catch (error){
      console.error(error);
      res.status(500).json({ error: 'Error processing PDF or querying Gemini' });
  }
});

router.post('/hr-resume-check', upload.single("file"), async (req, res) => {
  try{
    const dataBuffer = req.file.buffer;
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    const fileName = req.file.originalname;
    const requirements = req.body.requirements;
    const prompt = `Analyze the following resume and onlny answer in yes or no if the resume skills match with each of the required skills: ${requirements}\n\n${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const respText = response.text();

    console.log(formatTextWithBulletsAndIndentation(removeAsterisks(respText)));

    res.json({
      status: 'success',
      pdf: fileName,
      answer: formatTextWithBulletsAndIndentation(removeAsterisks(respText))
    });
  } catch (error){
      console.error(error);
      res.status(500).json({ error: 'Error processing PDF or querying Gemini' });
  } 
});


router.post('/resume-get-details', upload.single("file"), async (req, res) => {
  try{
    const dataBuffer = req.file.buffer;
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    const fileName = req.file.originalname;

    const prompt1 = `Analyze the following resume and just give me the resume owner's name and say nothing else.\n\n${text}`;
    const prompt2 = `Analyze the following resume and in just one word or phrase give me the domain the resume owner is best at and say nothing else.\n\n${text}`;

    const result1 = await model.generateContent(prompt1);
    const result2 = await model.generateContent(prompt2);
    const response1 = await result1.response;
    const response2 = await result2.response;
    const owner_name = response1.text();
    const resume_skills = response2.text();

    res.json({
      status: 'success',
      pdf: fileName,
      resume_name: owner_name,
      resume_skills: resume_skills
    });
  } catch (error){
      console.error(error);
      res.status(500).json({ error: 'Error processing PDF or querying Gemini' });
  }
});

router.post('/test', (req, res) => {
  res.send({message: 'this is a test area', name: 'kaif'});
})

module.exports = router