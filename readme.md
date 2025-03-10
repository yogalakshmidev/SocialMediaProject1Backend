# SOCIAL MEDIA APPLICATION(BACKEND)

# Setup:

```bash
npm install bcrypt cookie-parser cors dotenv express jsonwebtoken mongoose morgan multer nodemailer

npm install cloudinary datauri express-mongo-sanitize express-rate-limit helmet hbs hpp sharp slugify validator

```
setup: 
--create server.js  and app.js
    --In app.js -app.listen (port), app.use()-which act as middleware
    --express.json-- to access the body
    --express.static("upload")- to access our static files in the express for uploads,-- path: to serving our static files(express.static(path.jonin(--dirname,"publi")))
    --cors({origin:{'https://localhost:3000'},credentials:true})
    --config.env--- for security purpose to config our environmental variable... We need to config  and connect our db in server.js

    --- used for no routes path error handling
in app.js
    app.all("*",(req, res,next)=>{
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

Used to handle uncaught  exception errors:
    --- Process.on("UncaughtException",(err)=>{
            console.log("Uncaught Exception")
            console.log(err.name, err.message)
            process.exit(1);
            });

const userSchema = new mongoose.Schema({
  username:{
    type:String,
    required:[true,'Please add Username'],
    unique:true,
    trim:true,
    minlength:3,
    maxlength:30,
    index:true,
  },
  email:{
    type:String,
    required:[true,"Please provide email id"],
    unique:true,
    lowercase:true,
    validate: [validator.isEmail,"Please provide a valid Email id"],
  },
  password:{
    type:String,
    required:[true,"Please provide Password"],
    minlength:8,
    maxlength:30,
    select:false,
  },
  passwordConfirm:{
    type:String,
    required:[true,"Please confirm your Password"],
    validate:{
      validator: function (el){
        return el === this.password
      },
      message:"Passwords are not the same",
    },
    
  },
  profilePicture:{
    type:String,

  },
  bio:{
    type:String,
    maxlength:150,
    default:'',
  },
  followers:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
  },
  followering:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
  },
  posts:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Post',
  },
  savedPosts:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Post',
  },
  isVerified:{
    type:Boolean,
    default:false,
  },
  otp:{
    type:String,
    default:null,
  },
  otpExpires:{
    type:Date,
    default:null,
  },
  resetPasswordOTP:
  {
     type:String,
     default:null,
  },
  resetPasswordOTPExpires:
  {
     type:Date,
     default:null,
  },
  createdAt:{
    type:Date,
    default:Date.now,
  }
},{timestamps: true});

