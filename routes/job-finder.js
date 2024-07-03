const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');

dotenv.config();

router.get('/job-listings', async (req, res) => {
    try {
        const {city, country, skills} = req.body;
        const response = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_API_KEY}&results_per_page=20&what=${skills}&where=${city}`);

        const result = await response.json(); 
        res.json(result);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error);
    }
})

module.exports = router