const app = require('./app');

const dotenv = require('dotenv');

//Setting Up Config Files
dotenv.config({path:'./config/config.env'})

app.listen(process.env.PORT,()=>{
    console.log(`Server started on Port : ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
})