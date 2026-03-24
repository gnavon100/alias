/**
 * EmailJS Integration for sending flagged words
 * Uses EmailJS to send reports to gl.navon@gmail.com
 */

import emailjs from '@emailjs/browser';
import { FlaggedWord } from './wordFlags';

// EmailJS Configuration
const SERVICE_ID = 'daphnalias';
const TEMPLATE_ID = 'template_n9fhcu8';
const PUBLIC_KEY = 'NWVCWh51znas3iHa0';

// Initialize EmailJS immediately
emailjs.init(PUBLIC_KEY);

// Rate limiting
let lastEmailSent = 0;
const MIN_EMAIL_INTERVAL = 60000; // 1 minute between emails

/**
 * Send flagged words via email
 */
export const sendFlaggedWordsEmail = async (flags: FlaggedWord[]): Promise<boolean> => {
  // Check rate limit
  const now = Date.now();
  if (now - lastEmailSent < MIN_EMAIL_INTERVAL) {
    console.log('Rate limited: Email sent too recently. Please wait before sending again.');
    alert('נא להמתין דקה לפני שליחת דיווח נוסף');
    return false;
  }
  if (flags.length === 0) {
    console.log('No flagged words to send');
    return true; // Nothing to send
  }

  console.log(`Attempting to send ${flags.length} flagged words via EmailJS...`);
  
  try {
    // Format words for email (one per line with timestamp)
    const wordsList = flags
      .map(f => {
        const date = new Date(f.timestamp).toLocaleString('he-IL');
        return `${f.word} (${date})`;
      })
      .join('\n');

    const templateParams = {
      words_count: flags.length,
      words_list: wordsList,
      from_name: 'Alias Game Player'
    };

    console.log('Sending email with params:', templateParams);
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
    console.log('Email sent successfully:', response);
    lastEmailSent = now;
    return true;
  } catch (error) {
    console.error('Failed to send flagged words email:', error);
    alert(`Failed to send flagged words: ${error}`);
    return false;
  }
};
