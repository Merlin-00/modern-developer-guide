const fs = require('fs');
const path = require('path');

const envDir = path.join(__dirname, 'src', 'environments');
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

const envFile = path.join(envDir, 'environment.ts');
const devEnvFile = path.join(envDir, 'environment.development.ts');

const firebaseApiKey = process.env.FIREBASE_API_KEY || '';
const geminiApiKey = process.env.GEMINI_API_KEY || '';

const content = `export const environment = {
  production: true,
  firebase: {
    projectId: 'modern-developer-guide',
    appId: '1:918286380513:web:2782001571c0a6c607f6a0',
    storageBucket: 'modern-developer-guide.firebasestorage.app',
    apiKey: '${firebaseApiKey}',
    authDomain: 'modern-developer-guide.firebaseapp.com',
    messagingSenderId: '918286380513',
    measurementId: 'G-FSPESKLBZR',
    projectNumber: '918286380513',
    version: '2',
  },
  
  gemini: {
    apiKey: '${geminiApiKey}'
  }
};`;

// On Vercel (process.env.VERCEL) or if files don't exist locally, we write them
if (!fs.existsSync(envFile) || process.env.VERCEL) {
  fs.writeFileSync(envFile, content);
  console.log('Production environment file created successfully.');
}

if (!fs.existsSync(devEnvFile) || process.env.VERCEL) {
  fs.writeFileSync(devEnvFile, content.replace('production: true', 'production: false'));
  console.log('Development environment file created successfully.');
}
