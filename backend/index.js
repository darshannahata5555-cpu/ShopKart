import express from 'express'
import dotenv from 'dotenv'
import mongoose from "mongoose";
import dns from "node:dns";
import customerRoutes from './routes/customer.routes.js';
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config()

// Node's DNS resolver on this machine rejects SRV lookups from the default DNS server.
dns.setServers(["8.8.8.8", "1.1.1.1"])

const app = express()
const port = process.env.PORT || 8084

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(express.json())
app.use(cookieParser());

mongoose.connect(process.env.DB_URL, { dbName: "shopkart" }).then(()=>{
    console.log("DB Connected")
}).catch((error)=>{
    console.log('DB Connection failed')
    console.log(error.message)
})


app.use('/customers', customerRoutes)


app.get('/', (req,res) => {
    res.json({
        success:true,
        message:'ShopKart API is running'

    })
})

app.listen(port, () =>{
    console.log(`Server started at ${port}`)
})
