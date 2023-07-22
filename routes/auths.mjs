import express from 'express';
import bcrypt from 'bcrypt';
import jwt  from 'jsonwebtoken';
import User from '../models/users.mjs';
import dbErrorHandler from '../middleware/dbErrorHandler.mjs';
const router = express.Router();

router.post('/signup', async(req,res) => {
    try {
        const {name,email,password} = req.body;
    
        // check if email is in use
        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(409).json({message: "User already exists"});
    
        // hash password
        const hashPassword = await bcrypt.hash(password,10);

        //create user
        const user = await User.create({name,email,password: hashPassword,created: Date.now()})
        return res.status(201).json({message: "User Created Successfully",user});
    } catch (error) {
        console.log("Error creating user",error)
        if(error.name == "ValidationError") return dbErrorHandler(error,req,res);
        return res.status(500).json({message: 'Internal Server Error'});
    }
});
router.post('/signin', async(req,res) => {
    try {
        const {email,password} = req.body;

        //check if user exists
        const verifyUser = await User.findOne({email});
        if(!verifyUser) return res.status(404).json({message: "User does not exist"});
        
        //check password
        const isValidPassword = await bcrypt.compare(password,verifyUser.password);
        if(!isValidPassword) return res.status(401).json({message: 'Invalid Credentials'});

        //generate JWT token

        const token = jwt.sign({userId: verifyUser._id}, process.env.JWT_SECRET_KEY,{expiresIn : "1hr"});

        return res.status(200).json({message: "Signed in Successfully",token});
    } catch (error) {
        console.log("Error sigining user",error)
        return res.status(500).json({message: 'Internal Server Error'});
    }
});

export default router;