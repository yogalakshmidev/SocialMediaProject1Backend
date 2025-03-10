const nodemailer= require('nodemailer');
const { options } = require('../app');

const sendEmail = async(options)=>{
  const transporter = nodemailer.createTransport({
    service:"Gmail",
    auth:{
      user:process.env.EMAILID,
      pass:process.env.EMAILPASSWORD,
    },
  });


const mailOptions = {
  form:"Insta Stories",
  to: options.email,
  subject : options.subject,
  html:options.html,
};

await  transporter.sendMail(mailOptions);
};
module.exports = sendEmail;