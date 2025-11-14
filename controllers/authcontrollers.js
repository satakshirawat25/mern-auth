import bcrypt from 'bcryptjs'
import  jwt  from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import transporter from '../config/nodeMailer.js'




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

//sending email
        const mailOptions={
            from:process.env.SENDER_EMAIL,
            to:email,
            subject:'Welcome to the account',
            text:`your account has been created with email id: ${email}`
        }
        await transporter.sendMail(mailOptions);
        return res.json({success:true})

    }catch(error){
        res.json({success:false,message:error.message})

    }
}

///////////////login controller////////////
export const login = async(req,res)=>{
    const {email,password} = req.body;

    if(!email || !password){
        return res.json({success:false,message:'Email and password required'})
    }

    try{
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false,message:'Invalid email'})
        }

    //get password
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
             return res.json({success:false,message:'Invalid email'})
        }
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})

        //send token to response/cookie
        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV === 'production'?'none':'strict',
            maxAge:7*24*60*60*1000
        })
        return res.json({success:true})



    }catch(error){
         res.json({success:false,message:error.message})
    }

}

// -------------logout controller-------
 export const logout = async(req,res)=>{
    try{
        res.clearCookie('token',{
             httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV === 'production'?'none':'strict',
            maxAge:7*24*60*60*1000
        })
        return res.json({success:true,message:'Logged out'})


    }catch(error){
         res.json({success:false,message:error.message})
    }
}

export const sendVerifyOtp=async(req,res)=>{
    try{
        // const {userId}=req.body;
        const {userId}=req.user;

        const user=await userModel.findById(userId)
        if(user.isAccountVerified){
            return res.json({success:false,message:"account already verified"})
        }
       const otp = String(Math.floor( 100000 + Math.random()*900000))
       user.verifyOtp=otp;
       user.verifyOtpExpireAt=Date.now()+24*60*60*1000

       await user.save();
const mailOptions={
    from:process.env.SENDER_EMAIL,
            to:user.email,
            subject:'Welcome to the account',
            text:`Yout OTP is ${otp} .Verify your account using this OTP`
    }
            await transporter.sendMail(mailOptions);
        res.json({success:true,message:'verifications OTP sent on email'})

    }catch(error){
         res.json({success:false,message:error.message})
    }
}

export const verifyEmail = async(req,res)=>{
    const {userId,otp}=req.body;
    

    if(!userId||!otp){
        return res.json({success:false,message:'Missing Details'})
    }
    try{
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success:false,message:'user not found'})
        }

        if(user.verifyOtp === ''|| user.verifyOtp !==otp){
            return res.json({success:false,message:'invalid Otp'})
        }
        if(user.verifyOtpExpireAt<Date.now()){
            return res.json({success:false,message:'OTP Expired'})
        }
         user.isAccountVerified= true
         user.verifyOtp= '';
         user.verifyOtpExpireAt=0;

         await user.save()
         return res.json({success:false,message:'Email verifies successfully'})
    }catch(error){
            res.json({success:false,message:error.message})
    }
}