#!/usr/bin/env /usr/local/bin/node

const fs = require('fs');
const path = require('path');

function main() {
  // Get the speed from command-line argument, default to 1.4
  const speed = parseFloat(process.argv[2]) || 1.4;
  if (isNaN(speed)) {
    console.error('Invalid speed value. Using default 1.4.');
    speed = 1.4;
  }

  // JavaScript to set playback speed with debug logs
  const jsCode = `(function(){console.log("YouTube speed script started");function setSpeed(){const video=document.querySelector("video");if(video){video.playbackRate=${speed};console.log("Speed set to ${speed}");return true}console.log("Video element not found");return false}if(!setSpeed()){console.log("Starting MutationObserver");const observer=new MutationObserver(()=>{if(setSpeed()){observer.disconnect();console.log("Observer disconnected")}});observer.observe(document.body,{childList:true,subtree:true})}})();`;

  // Log the JavaScript being sent
  console.log(`Attempting to write to FIFO with JavaScript: :jseval ${jsCode}`);

  // Determine FIFO path
  const fifoPath =
    process.env.QUTE_FIFO || path.join(process.env.HOME, '.local/share/qutebrowser/fifo');
  console.log(`FIFO path: ${fifoPath}`);

  // Write JavaScript to FIFO
  try {
    fs.writeFileSync(fifoPath, `:jseval ${jsCode}\n`, { encoding: 'utf8' });
    console.log('JavaScript successfully sent to FIFO');
  } catch (error) {
    console.error(`Error writing to FIFO: ${error.message}`);
    if (error.code === 'ENOENT') {
      console.error('FIFO file not found. Ensure qutebrowser is running.');
    }
  }
}

main();
