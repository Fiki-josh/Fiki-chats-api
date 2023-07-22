import express from 'express';
import jwt  from 'jsonwebtoken';
import User from '../models/users.mjs';
import bcrypt from 'bcrypt';
const router = express.Router();

const authMiddleware = (req,res,next) => {
    const token = req.headers.authorization;
    if(!token) return res.status(401).json({message: "Unauthorized"});

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err,decoded) => {
        if(err) return res.status(401).json({message: 'Invalid Token'});

        req.userId = decoded.userId;
        next();
    });
};

router.get('/profile', authMiddleware, async (req,res) => {
    try {
        const user = await User.findById(req.userId);
    
        if(!user) return res.status(404).json({message: "User not Found"});
    
        return res.status(200).json({message: 'User Found', user});
        
    } catch (error) {
        console.error("Error fetching User",error);
        return res.status(500).json({message: "Internal Server Error"});
    }
});

router.get('/users',authMiddleware, async(_req,res) => {
    try {
        const users = await User.find({}).select('-password');
        if(!users) return res.status(404).json({message: "No Users Found"});

        return res.status(200).json({message: "Users Found",users});

    } catch (error) {
        console.error("Error Fetching Users: ",error);
        return res.status(500).res.json({message: "Internal server Error"});
    }
});

router.put('/update-account', authMiddleware, async (req, res) => {
    try {
        const {name,email,password} = req.body
        const hashPassword = await bcrypt.hash(password,10);

        const updatedData = await User.findByIdAndUpdate(
            req.userId, 
            {name,email,password: hashPassword, updated: Date.now()},
            {new: true}
        );

        return res.status(200).json({message: "Data Successfully Updated", updatedData});
    } catch (error) {
        console.error("Error Updating Data: ", error)
        return res.status(500).res.json({message: "Internal server Error"});
    }
});

router.delete('/delete-account', authMiddleware, async (req, res) =>{
    try {
        await User.findByIdAndDelete(req.userId);
        res.status(200).json({message: "Account Deleted Successfully"});
    } catch (error) {
        console.error("Error Deleting Usser",error);
        res.status(500).json({message: "Internal Server Error"});
    }
});
export default router;