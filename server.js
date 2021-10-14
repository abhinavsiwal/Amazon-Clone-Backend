const app = require('./app');
const connectDatabase = require('./configs/database')
const dotenv = require('dotenv');

//Setting Up Config Files
dotenv.config({path:'./config/config.env'})

//Connecting to Database
connectDatabase()

app.listen(process.env.PORT,()=>{
    console.log(`Server started on Port : ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
}) 