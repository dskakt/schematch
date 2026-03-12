import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';

async function generateFavicon() {
  try {
    // Read the SVG file directly
    const svgContent = fs.readFileSync('client/public/favicon.svg', 'utf-8');
    
    // Scale up the viewBox for higher resolution
    const scaledSvg = svgContent
      .replace('viewBox="0 0 100 100"', 'viewBox="0 0 512 512"')
      .replace('width="100"', 'width="512"')
      .replace('height="100"', 'height="512"')
      .replace('font-size="70"', 'font-size="360"')
      .replace('x="50"', 'x="256"')
      .replace('y="50"', 'y="256"');
    
    const resvg = new Resvg(scaledSvg, {
      fitTo: {
        mode: 'width',
        value: 512,
      },
    });
    
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    
    fs.writeFileSync('client/public/favicon.png', pngBuffer);
    
    console.log('Favicon generated successfully!');
    console.log('PNG size:', pngBuffer.length, 'bytes');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon();
