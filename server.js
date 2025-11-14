import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import authRouter from './routes/authRoutes.js'

const app = express()

const port = process.env.PORT || 4000
connectDB()

app.use(express.json())
app.use(cookieParser())
app.use(cors({credentials:true}))


//API endpoints
app.get('/',(req,res)=>{
    res.send("the url hit")})

    app.use('/api/auth/', authRouter)

app.listen(port,(req,res)=>{
    console.log(`app running at port:${port}`)
})