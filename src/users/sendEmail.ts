import { HttpException, HttpStatus } from "@nestjs/common";
import { transporter } from "./emailConfig";

export async function sendEmail(to:string,data:any){
    const mailOptions = {
        from: "sanafaraji82@gmail.com",
        to: to,
        subject: "Email verification",
        text: `${data}`,
      };
      try{
    const result=await  transporter.sendMail(mailOptions)
    
    }catch(err){
      throw new HttpException(err,HttpStatus.NOT_ACCEPTABLE)
    }
}