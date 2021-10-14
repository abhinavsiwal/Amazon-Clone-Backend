const mongoose = require('mongoose');

const connectDatabase = async()=>{
    mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mjbym.mongodb.net/development?retryWrites=true&w=majority`).then(()=>{
        console.log("Database Connected");
    }).catch(err=>{
        console.log(err);
    })
}

module.exports = connectDatabase;