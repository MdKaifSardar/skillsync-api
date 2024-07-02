const express = require('express')
const mongoose = require('mongoose');
const app = express();
const PORT = 5000;
var cors = require('cors');
const ResumeRoute = require('./routes/resume-query');
const JobRoute = require('./routes/job-finder');
const dbPass = process.env.MONGODB_PASS;


app.use(cors({
  origin: 'https://skill-sync-jet.vercel.app'
}));
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://skill-sync-jet.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.options('*', cors());

app.use('/api/resume', ResumeRoute);
app.use('/api/job', JobRoute);

app.get('/', (req, res) => {
    res.send("hello the user");
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

