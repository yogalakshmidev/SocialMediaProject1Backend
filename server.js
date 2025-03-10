const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Error Handling
process.on("UncaughtException",(err)=>{
  console.log("Uncaught Exception")
  console.log(err.name, err.message)
  process.exit(1);
});

dotenv.config({path:"./config.env"})

const app = require('./app');
const port = process.env.PORT || 3001;
// to connect with our database
mongoose.connect(process.env.MONGODB_URI).then(()=>{
  console.log("Database connection successfully");
}).catch((error)=>{
  console.log("Error in Database connection",error);
})


const server = app.listen(port,()=>{
  console.log(`Server running on the port is ${port}`);
})

// Error Handling
process.on('unhandleRejection',(err)=>{
  console.log("Unhandle Rejection");
  console.log(err.name);
  console.log(err.message);
  server.close(()=>{
    process.exit(1);
  })
})