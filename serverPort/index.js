import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connection } from './db/db.js';

const app = express();
app.use(cors());
dotenv.config();
const DB_URL = process.env.DATABASE_URL 

app.get('/', ()=>{
    res.send("<h1>server port is running</h1>")
})

app.listen(3000, ()=>{
    console.log("server is running")
})

connection(DB_URL);

// if by any chance the server will crash, port will not charge any vehicle
setInterval(async ()=>{
    await fetch('http://localhost:8080/status',{
        method:"POST",
    })
},10000)