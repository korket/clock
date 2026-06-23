const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('src/index.html', 'utf8');
const js = fs.readFileSync('src/app.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "outside-only" });
const window = dom.window;
const document = window.document;

// Mock scrollTo
window.Element.prototype.scrollTo = function() {};

// Mock Tauri
window.__TAURI__ = {
    core: {
        invoke: async (cmd) => {
            if (cmd === 'load_state') return '';
            return null;
        }
    }
};
window.requestAnimationFrame = (cb) => setTimeout(cb, 16);
window.cancelAnimationFrame = clearTimeout;

dom.window.eval(js);

// Run init
setTimeout(() => {
    try {
        console.log("App init finished.");
        
        // Open settings
        document.querySelector('#pomodoro-settings-btn').click();
        console.log("Settings opened.");
        
        // Change setting
        document.querySelector('#pomo-focus-input').value = '30';
        
        // Save
        document.querySelector('#pomo-save-btn').click();
        console.log("Settings saved.");
        
    } catch (e) {
        console.error("Error:", e);
    }
}, 100);
