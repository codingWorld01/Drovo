import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

// Puppeteer configuration for different environments
const getPuppeteerConfig = (showBrowser = false) => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    headless: isProduction ? true : !showBrowser,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ],
    // Remove hardcoded Windows path - let Puppeteer find Chrome automatically
    executablePath: isProduction ? undefined : undefined
  };
};

// Initialize whatsapp-web.js with session persistence
let client;
if (fs.existsSync('./session.json')) {
  try {
    const sessionData = JSON.parse(fs.readFileSync('./session.json'));
    client = new Client({
      session: sessionData,
      puppeteer: getPuppeteerConfig(false), // Always headless with existing session
      webVersion: '2.2412.54',
    });
  } catch (error) {
    console.error('Error loading session:', error);
    fs.unlinkSync('./session.json'); // Clear invalid session
  }
}

if (!client) {
  client = new Client({
    puppeteer: getPuppeteerConfig(true), // Show browser for initial QR in dev, headless in prod
    webVersion: '2.2412.54',
  });
}

client.on('ready', () => {
  console.log('WhatsApp client ready');
});

client.on('qr', (qr) => {
  console.log('Scan this QR code with your WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', (session) => {
  console.log('WhatsApp session authenticated');
  fs.writeFileSync('./session.json', JSON.stringify(session));
});

client.on('disconnected', (reason) => {
  console.log('WhatsApp client disconnected:', reason);
  if (fs.existsSync('./session.json')) {
    fs.unlinkSync('./session.json'); // Clear session on disconnection
  }
  client.initialize(); // Reinitialize to generate a new QR code
});

client.initialize();

// Send FCM Notification
export const sendFCMNotification = async (fcmToken, title, body) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      token: fcmToken,
    };
    const response = await admin.messaging().send(message);
    console.log('FCM notification sent:', response);
    return true;
  } catch (error) {
    console.error('Error sending FCM notification:', error);
    return false;
  }
};

// Send WhatsApp Notification
export const sendWhatsAppNotification = async (phone, message) => {
  try {
    const chatId = `${phone}@c.us`;
    await client.sendMessage(chatId, message);
    console.log('WhatsApp notification sent to:', phone);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return false;
  }
};

// Send Email Notification
export const sendEmailNotification = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};