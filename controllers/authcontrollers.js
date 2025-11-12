import bcrypt from 'bcrypt.js'
import { JsonWebTokenError } from 'jsonwebtoken'
import userModel from '../models/userModel'
import dotenv from 'dotenv'

export const register = async(req,res)=>{
    const {name,email,password}=req.body

    if(!name || !email ||!password){
        return res.json({success:false,message:'Missing Details'})
    }

    // if name or email or password hai toh....
    try{
        const existingUser = await userModel.findOne({email})

        if(existingUser){
            return res.json({success:false,message:'user already exist'})
        }
       
        const hashedPassword = await bcrypt.hash(password,10)
         //create new user for databse
        const user = new userModel({name,email,password:hashedPassword})

        //save user into database
        await user.save()

        //generate the token using jwt

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})

        //send token to cookie
        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV === 'production'?'none':'strict',
            maxAge:7*24*60*60*1000
        })

    }catch(error){
        res.json({success:false,message:error.message})

    }
}


export const login = async(req,res)=>{
    
}