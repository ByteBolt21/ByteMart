import nodemailer from 'nodemailer';
import logger from './logger.js';

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
    //   secure: false, // true for 465, false for other ports
      service : "outlook",
      auth: {
        user: 'hassaananjum001@outlook.com',
        pass: '******'
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
