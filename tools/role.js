const crypto = require('crypto');

// --- Configuration ---
const players = ['soheil', 'mahdi', 'nila', 'sara', 'khorshid', 'amirreza', 'amirhosein', 'mahdiyar'];
let rules = ['merlin', 'percival', 'loyal', 'loyal', 'loyal', 'assassin', 'mordred', 'morgana'];

// --- Encryption Function (Matches your Web Crypto API) ---
function encryptText(text, password) {
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    
    // Derive Key (PBKDF2-HMAC-SHA256, 100k iterations)
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    
    // Encrypt
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Get Auth Tag
    const authTag = cipher.getAuthTag();
    
    // Combine: Salt + IV + Encrypted + AuthTag
    const combined = Buffer.concat([salt, iv, encrypted, authTag]);
    
    return combined.toString('base64');
}

// --- Helper Functions ---
function seeThumb(players, playersRules, targetRules) {
    let text = '';
    for (let i = 0; i < players.length; i++) {
        if (targetRules.includes(playersRules[i])) {
            text += ', ' + players[i];
        }
    }
    return text;
}

// --- Main Logic ---
function generateGameEncryptions() {
    // Shuffle rules
    rules.sort(() => Math.random() - 0.5);

    if (players.length !== rules.length) {
        console.log('Error: Player count does not match rules count.');
        return;
    }

    console.log("--- Generating Encrypted Role Cards ---\n");

    players.forEach((player, index) => {
        const role = rules[index];
        const password = index + 1; // Password is their player number (1, 2, 3...)

        // 1. Build the secret info text
        let infoText = `(rule : ${role}`;

        if (role === 'merlin') {
            infoText += seeThumb(players, rules, ['assassin', 'morgana', 'oberon', 'spy']);
        } else if (role === 'percival') {
            infoText += seeThumb(players, rules, ['merlin', 'morgana']);
        } else if (role === 'assassin') {
            infoText += seeThumb(players, rules, ['mordred', 'morgana', 'spy']);
        } else if (role === 'mordred') {
            infoText += seeThumb(players, rules, ['assassin', 'morgana', 'spy']);
        } else if (role === 'morgana') {
            infoText += seeThumb(players, rules, ['mordred', 'assassin', 'spy']);
        } else if (role === 'spy') {
            infoText += seeThumb(players, rules, ['assassin', 'mordred', 'morgana', 'spy']);
        }
        
        infoText += ')';

        // 2. Add the random padding (to mimic the original Python script length)
        // We also append the NUMBER needed for the calculation here.
        // Let's say the number is the player's index + 1.
        const secretNumber = password; 
        
        // Add random chars to reach a certain length, then append the number
        while (infoText.length < 80) {
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789 !@#$%^&*()-_+=?';
            infoText += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Append the number clearly at the end so the decryptor can find it
        infoText += ` NUMBER:${secretNumber}`;

        // 3. Encrypt
        const encryptedString = encryptText(infoText, String(password));

        // 4. Output
        console.log(`Player: ${player}`);
        console.log(`Password (Give this to them): ${password}`);
        console.log(`Encrypted String (Send this to them):`);
        console.log(encryptedString);
        console.log('--------------------------------------------------');
    });
}

// Run the generator
generateGameEncryptions();