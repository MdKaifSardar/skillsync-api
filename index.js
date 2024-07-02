const express = require('express')
const mongoose = require('mongoose');
const app = express();
const PORT = 5000;
var cors = require('cors');
const ResumeRoute = require('./routes/resume-query');
const JobRoute = require('./routes/job-finder');
const dbPass = process.env.MONGODB_PASS;


app.use(cors({
    origin: "https://skill-sync-jet.vercel.app",
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

app.post('/temp-fetch', (req, res) => {
    try{
        res.send({name: "kaif", age: "19"});
    } catch(error){
        res.status(404).send({error: error});
    }
})

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

