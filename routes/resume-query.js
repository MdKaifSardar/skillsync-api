const express = require('express');
const router = express.Router();
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const PDF = require('../models/pdfdetails');


const API_KEY = process.env.GEMINI_API_KEY;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});


const removeAsterisks = (text) => {
    return text.replace(/\*/g, '');
}

function formatTextWithBulletsAndIndentation(text) {
  // Split the text by colons and keep the colons in the result
  const splitText = text.split(/(:)/);

  // Initialize an empty result array
  let result = [];

  // Iterate over the split text
  for (let i = 0; i < splitText.length; i++) {
    const item = splitText[i].trim();
    if (item) {
      // If the item is a colon, add a line break and a tab
      if (item === ":") {
        result.push(":\n\t");
      } 
      else {
        // Add bullet points if it's not a colon
        if (i === 0 || splitText[i - 1] === ":") {
          result.push(`• ${item}`);
        } else {
          result.push(item);
        }
      }
    }
  }

  // Join the array into a single string
  return result.join('');
}

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, "./files");
    const uploadDir = './files';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});
const upload = multer({ storage: storage });


router.post('/resume-check', upload.single("file"), async (req, res) => {
    try{
        const filePath = req.file.path;
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        const text = pdfData.text;
        // const title = req.body.title;
        const title = 'file 1';
        const fileName = req.file.filename;
        const requirements = req.body.requirements;
        const prompt = `Analyze this resume and state in yes or no if the candidate is eligible for a job requiring skills like ${requirements} \n\n${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const respText = response.text();

        await PDF.create({
            title: title,
            pdf: fileName
        })

        res.json({
          status: 'success',
          // title: title,
          pdf: fileName,
          answer: formatTextWithBulletsAndIndentation(removeAsterisks(respText))
        });
    } catch (error){
        console.error(error);
        res.status(500).json({ error: 'Error processing PDF or querying Gemini' });
    } finally {
        fs.unlinkSync(req.file.path); 
    }
});


router.post('/resume-query', upload.single("file"), async (req, res) => {
  try{
    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    // const title = req.body.title;
    const title = 'file 1';
    const fileName = req.file.filename;
    const query = req.body.query;

    const prompt = `Analyze the following resume and answer in short the query ${query} \n\n${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const respText = response.text();

    await PDF.create({
      title: title,
      pdf: fileName
    })

    console.log(formatTextWithBulletsAndIndentation(removeAsterisks(respText)));

    res.json({
      status: 'success',
      // title: title,
      pdf: fileName,
      answer: formatTextWithBulletsAndIndentation(removeAsterisks(respText))
    });
  } catch (error){
      console.error(error);
      res.status(500).json({ error: 'Error processing PDF or querying Gemini' });
  } finally {
      fs.unlinkSync(req.file.path); 
  }
});

router.post('/hr-resume-check', upload.single("file"), async (req, res) => {
  try{
    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    const fileName = req.file.filename;
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
  } finally {
      fs.unlinkSync(req.file.path); 
  }
});


router.post('/resume-get-details', upload.single("file"), async (req, res) => {
  try{
    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    const fileName = req.file.filename;

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
  } finally {
      fs.unlinkSync(req.file.path); 
  }
});

module.exports = router