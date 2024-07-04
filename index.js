const express = require('express')
const mongoose = require('mongoose');
const app = express();
const PORT = 5000;
require('dotenv').config();
const dbPass = process.env.MONGODB_PASS;
app.use(express.json());

app.use('/api/resume', require('./routes/resume-query'));
app.use('/api/job', require('./routes/job-finder'));
app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => {
    res.send("hello the user");
});

app.get('/test', (req, res) => {
  res.send('this is a test api in the index page');
})

mongoose.connect(`mongodb+srv://mkaifsard564773:${dbPass}@pdfdb.9eent9l.mongodb.net/Skillsync?retryWrites=true&w=majority&appName=PDFDB`)
.then(() => {
    console.log('The db is Connected!');
    app.listen(PORT, () => {
        console.log(`listeinng to ${PORT}`);
    })
})
.catch(() => {
    console.log("The db is not connected");
})

