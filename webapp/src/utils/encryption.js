import CryptoJS from 'crypto-js';
import { IV, SECRET_KEY } from '../config.js'

export const encryptQuestion = (question) => {
  const ivWordArray = CryptoJS.enc.Utf8.parse(IV);
  const keyWordArray = CryptoJS.enc.Utf8.parse(SECRET_KEY);
  
  const encrypted = CryptoJS.AES.encrypt(question, keyWordArray, {
    iv: ivWordArray,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  return encrypted.toString();
};

export const decryptAnswer = (encryptedAnswer) => {
  try {
    const ivWordArray = CryptoJS.enc.Utf8.parse(IV);
    const keyWordArray = CryptoJS.enc.Utf8.parse(SECRET_KEY);
    
    const decrypted = CryptoJS.AES.decrypt(encryptedAnswer, keyWordArray, {
      iv: ivWordArray,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return 'Error decrypting response';
  }
};