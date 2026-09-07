// One-time script to generate a VAPID key pair for Web Push notifications.
// Run once with: node scripts/generateVapidKeys.js
// Then copy the printed keys into your .env files (see instructions printed
// below) — you do NOT need to run this again after that.

import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("\nVAPID keys generated. Add these to backend/.env:\n");
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:himanshugoud638@gmail.com`);
console.log("\nAlso add this one line to frontend/.env (public key only — safe to expose client-side):\n");
console.log(`VITE_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log("\nDon't forget to add the same three backend variables to Render's environment settings too.\n");