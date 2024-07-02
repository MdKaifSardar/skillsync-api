const express = require('express')
const mongoose = require('mongoose');
const app = express();
const PORT = 5000;
const dbPass = process.env.MONGODB_PASS;
const ResumeRoute = require('./routes/resume-query');
const JobRoute = require('./routes/job-finder');
app.use(express.json());

app.use('/api/resume', ResumeRoute);
app.use('/api/job', JobRoute);

app.get('/', (req, res) => {
    res.send("hello the user");
});

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/resume-check', upload.single("file"), async (req, res) => {
  try{
    console.log('hehe inside resume-check');
    const dataBuffer = req.file.buffer;
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    console.log(text);
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
      res.status(500).json({ status: error, answer: 'there is no answer' });
  } 
});

app.listen(PORT, () => {
  console.log(`listeinng to hhaa ${PORT}`);
})


// mongoose.connect(`mongodb+srv://mkaifsard564773:${dbPass}@pdfdb.9eent9l.mongodb.net/PdfDetails?retryWrites=true&w=majority&appName=PDFDB`)
// .then(() => {
//     console.log('The db is Connected!');
//     app.listen(PORT, () => {
//         console.log(`listeinng to hhaa ${PORT}`);
//     })
// })
// .catch(() => {
//     console.log("The db is not connected");
// })

