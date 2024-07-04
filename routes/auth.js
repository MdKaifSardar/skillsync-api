const express = require('express');
const User = require('../models/user');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET_WORD;
const fetchuser = require('../middleware/fetchuser');


// ROUTE-1: Creating a user account Path: /api/auth/createuser:
router.post('/createuser', [
    body('name', "enter a valid name").isLength({ min: 3 }),
    body('email', "enter a valid email").isEmail(),
    body('password', "enter a valid pass").isLength({ min: 5 }),
], async (req, res) => {
    const errors = validationResult(req);
    let success = false;
    // If there are errors this will point them out
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }
    try {
        // Checking if the user exists or not
        let user = await User.findOne({email: req.body.email});
        if(user){
            return res.status(400).json({
                success,
                error: "sorry a user with this emailid exists already"
            })
        }

        // adding password protection
        const salt = await bcrypt.genSaltSync(10); // adding salt
        const secPass = await bcrypt.hashSync(req.body.password, salt); // generating password hash

        // creating and saving the users to mongo db
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })

        const data = {
            user: {
                id: user.id
            }
        }
        // creating an authentication token
        const authToken = jwt.sign(data, JWT_SECRET);
        // success = true;
        // returning a token to the user
        res.json({success: true, authToken});

        // returning the user the data entered and saved to db
    } catch (error){ // catchin gerror in case we screw up bad
        console.error(error.message);
        return res.status(500).send("some error has occurred");
    }
})


// ROUTE-2: User login verification Path: /api/auth/login:
router.post('/login', [
    body('email', "enter a valid email").isEmail(),
    body('password', "password cannot be blank").exists(),
], async (req, res) => {
    const {email, password} = req.body;
    const errors = validationResult(req);
    let success = false;
    // If there are errors this will point them out
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }
    try {   
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success, error: "No match, please try to login with correct credentials"});
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare){
            return res.status(400).json({success, error: "No match, please try to login with correct credentials"});
        }
        const data = {
            user: {
                id: user.id
            }
        }
        success = true;
        // creating an authentication token
        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({success, authToken: authToken});
    }catch(error){
        console.error(error.message);
        res.status(500).send("some malfunction happened wait for it to be resolved");
    }
})


// ROUTE-3: Get logged in user details Path: /api/auth/getuser:
router.post('/getuser', fetchuser, async (req, res) => {
    let success = false;
        try{
            const userId = req.user.id;
            const userFound = await User.findById(userId).select("-password");
            success = true;
            res.json({msg: "this is the resp", success, userFound});
        }catch(error){
            console.error(error.message);
            res.status(500).json({error: "Something bad occurred"});
        }

})

module.exports = router;