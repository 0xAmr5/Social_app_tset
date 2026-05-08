import nodemailer from "nodemailer";
import {
  MAIL_APP_PASSWORD,
  MAIL_APP_SENDER,
} from "../../../config/config.services.js";
import mailEnum from "../../enum/mail.enum.js";
import Mail from "nodemailer/lib/mailer/index.js";
import { sendOtp } from "./email.templetes.js";

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: MAIL_APP_SENDER,
    pass: MAIL_APP_PASSWORD,
  },
});

export async function sendMail({
  to,
  subject,
  data,
}: {
  to: string;
  subject: string;
  data: any;
}) {
  console.log(data)
  await transport.sendMail({
    from: MAIL_APP_SENDER,
    to,
    subject,
    html: sendOtp(data) ,// function(){
    // if (subject == mailEnum.consrimSingUp) {
    //   return sendOtp(data);
    // } 
  } as Mail.Options);
}

export const genrateOtp = () => {
  return Math.floor(Math.random() * 100000);
};