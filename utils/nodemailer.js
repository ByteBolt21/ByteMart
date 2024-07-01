import nodemailer from 'nodemailer';
import logger from './logger.js';


const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host:  process.env.SMTP_HOST,
      port:  process.env.SMTP_PORT,
    //   secure: false, // true for 465, false for other ports
      service : process.env.SMTP_SERIVCE,
      secure: false,
      auth: {
        user:  process.env.SMTP_MAIL,
        pass:  process.env.SMTP_PASSWORD
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to,
      subject,
      text
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    throw error;
  }
};

export default sendEmail;
