import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#3b82f6"/>
  <text x="256" y="256" font-family="sans-serif" font-size="360" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">ス</text>
</svg>`;

async function generateFavicon() {
  try {
    const resvg = new Resvg(svgContent, {
      fitTo: {
        mode: 'width',
        value: 512,
      },
    });
    
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    
    fs.writeFileSync('client/public/favicon.png', pngBuffer);
    
    console.log('Favicon generated successfully!');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon();
