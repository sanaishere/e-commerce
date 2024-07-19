const nodemailer=require('nodemailer')
require('dotenv').config()
export const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user:process.env.GMAIL,
      pass: process.env.G_PASS,
    },
  });
  
