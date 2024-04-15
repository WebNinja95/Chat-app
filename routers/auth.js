import express from 'express';
import User from '../models/user.js'
import purify from '../utils/sanitizie.js';
import {userAuthenticationRegister,userAuthenticationLogin} from '../validation/user.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto';
import bodyParser from "body-parser";
import sendEmail from '../utils/sendEmail.js'
import {generateToken} from '../utils/token.js';
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname} from 'path';
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicPath = path.join(__dirname, '..', 'public');

router.use(express.static(publicPath));
router.use(bodyParser.urlencoded({ extended: false }));



router.get('/register',(req,res)=>{
    const registerPath = path.join(publicPath, 'register.html');
    res.sendFile(registerPath);
})

router.post('/register', async (req, res) => {
    try {
        Object.keys(req.body).forEach(key => {
            req.body[key] = purify.sanitize(req.body[key]);
        });

        const { error } = userAuthenticationRegister.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let fullName = req.body.fullName.trim();
        let userName = req.body.userName.trim();
        let email = req.body.email.trim();
        let password = req.body.password;

        if (fullName && userName && email && password) {
            let user = await User.findOne({
                $or: [
                    { username: userName },
                    { email: email }
                ]
            });
            if (user) return res.status(400).send('User already exists');

            const salt = await bcrypt.genSalt();
            req.body.password = await bcrypt.hash(req.body.password, salt);

            const newUser = await User.create(req.body);

            const tokenProps = {
                id: newUser._id,
                userName: newUser.userName,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic,
                isAdmin: newUser.isAdmin
            };
            const token = generateToken(tokenProps);
            console.log(token);
            res.cookie('access_token', token, {
                httpOnly: true,
                // secure: true,
            }).status(201).redirect('/api/auth/login');
        } else {
            return res.status(400).send('Missing required fields');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Something went wrong');
    }
});

router.get('/login',async (req,res)=>{
    const loginPath = path.join(publicPath, 'login.html');
    res.sendFile(loginPath);
})


router.post('/login', async (req, res) => {
    try {
        // Sanitize user input
        Object.keys(req.body).forEach(key => {
            req.body[key] = purify.sanitize(req.body[key]);
        });

        // Validate user input
        const { error } = userAuthenticationLogin.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        // Check if the user exists
        const user = await User.findOne({ userName: req.body.userName });
        if (!user) return res.status(400).send('User not registered yet');

        // Verify password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).send('Invalid password');

        // Generate JWT token
        const tokenProps = {
            id: user._id,
            userName: user.userName,
            fullName: user.fullName,
            profilePic: user.profilePic,
            isAdmin: user.isAdmin
        };
        const token = generateToken(tokenProps);

        // Set the JWT token as a cookie
        res.cookie('access_token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production', // Only secure in production
        });

        // Redirect the user to the homepage
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



router.get('/logout', (req, res) => {
    // Clear the access token cookie
    res.clearCookie('access_token');
    // Redirect the user to the home page or any other desired location
    res.redirect('/');
});

router.get('/forgot-password',(req,res)=>{
    const forgotPath = path.join(publicPath, 'email-password.html');
    res.sendFile(forgotPath);
}
)

router.post('/forgot-password',async (req,res)=>{
    const {email} = req.body;
    console.log(email);
    const user = await User.findOne({email:email});
    console.log(user);
    if(!user){
        return res.status(200).send('wrong wow check ur email');
    }
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const link = `http://localhost:3000/api/auth/reset-password/${token}`;
    const message = `<h1>you requested a password reset</h1>
    <p>Click<a href="${link}">this link</a> to reset ur password</p>`
    const isEmailSend = await sendEmail(email,'password reset request',message)
    if(isEmailSend){

        res.status(200).send('check ur email')
    }
    else{
        res.status(500).send('something went wrong')
    }

})

router.get('/reset-password/:token',(req,res)=>{
    const resetPath = path.join(publicPath, 'reset-password.html');
    res.sendFile(forgotPath);
}
)

router.post('/reset-password/:token',async (req,res)=>{
    const {token} = req.params;
    const {password} = req.body;

    const user = await User.findOne({
        resetPasswordToken:token,
        resetPasswordExpires:{$gt:Date.now()}
    })
    if(!user){
        return res.status(401).send('invalid token or token expired');
    }
    try{
    const hashedPassword = await bcrypt.hash(password,10);
    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).redirect('/api/auth/login','password changed!');
    }
    catch(error){
        res.status(500).send('something went wrong while updating password')
    }
})

export default router