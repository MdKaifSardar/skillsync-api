const express = require('express')
const mongoose = require('mongoose');
const app = express();
const PORT = 5000;
var cors = require('cors');
const ResumeRoute = require('./routes/resume-query');
const JobRoute = require('./routes/job-finder');
const dbPass = process.env.MONGODB_PASS;


app.use(cors({
    origin: "*",
    methods: ["POST", "GET"],
    credentials: true
}));

app.use(express.json());
app.use("/files", express.static("files"));

app.use('/api/resume', ResumeRoute);
app.use('/api/job', JobRoute);

app.get('/', (req, res) => {
    res.send("hello the user");
});



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

app.post('/resume-check', upload.single("file"), async (req, res) => {
    try{
        const filePath = req.file.path;
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        const text = pdfData.text;
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





// connecting to the mongodb database
mongoose.connect(`mongodb+srv://mkaifsard564773:${dbPass}@pdfdb.9eent9l.mongodb.net/PdfDetails?retryWrites=true&w=majority&appName=PDFDB`)
.then(() => {
    console.log('The db is Connected!');
    app.listen(PORT, () => {
        console.log(`listeinng to hhaa ${PORT}`);
    })
})
.catch(() => {
    console.log("The db is not connected");
})

