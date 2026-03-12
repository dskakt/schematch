import { createCanvas } from 'canvas';
import fs from 'fs';

// Create a 512x512 canvas
const canvas = createCanvas(512, 512);
const ctx = canvas.getContext('2d');

// Fill with blue background
ctx.fillStyle = '#3b82f6';
ctx.fillRect(0, 0, 512, 512);

// Draw white katakana "ス"
ctx.fillStyle = 'white';
ctx.font = 'bold 350px sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('ス', 256, 256);

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('client/public/favicon.png', buffer);

console.log('Successfully created favicon.png with katakana ス');
