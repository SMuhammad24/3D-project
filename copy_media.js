import fs from 'fs';
import path from 'path';

const mediaDir = path.resolve('public/media');
const files = fs.readdirSync(mediaDir);

for (const file of files) {
  if (file.includes('disassembles') && file.endsWith('.mp4')) {
    fs.copyFileSync(path.join(mediaDir, file), path.join(mediaDir, 'disassembly-video.mp4'));
    console.log('Copied disassembly-video.mp4:', fs.statSync(path.join(mediaDir, 'disassembly-video.mp4')).size);
  }
  if (file.includes('technical') && file.endsWith('.mp4')) {
    fs.copyFileSync(path.join(mediaDir, file), path.join(mediaDir, 'breakdown-video.mp4'));
    console.log('Copied breakdown-video.mp4:', fs.statSync(path.join(mediaDir, 'breakdown-video.mp4')).size);
  }
}
