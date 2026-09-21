const crypto = require('crypto');

/**
 * Decrypts AES-GCM encrypted text using a password.
 * Matches the logic of the provided Web Crypto API encryption.
 */
function decryptText(encryptedBase64, password) {
    try {
        const data = Buffer.from(encryptedBase64, 'base64');
        
        // Extract Salt (first 16 bytes) and IV (next 12 bytes)
        const salt = data.subarray(0, 16);
        const iv = data.subarray(16, 28);
        const ciphertext = data.subarray(28);
        
        // Derive Key (PBKDF2-HMAC-SHA256, 100k iterations)
        const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
        
        // Decrypt
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        
        // Handle Auth Tag (last 16 bytes of ciphertext)
        const tagLength = 16;
        const encryptedContent = ciphertext.subarray(0, ciphertext.length - tagLength);
        const authTag = ciphertext.subarray(ciphertext.length - tagLength);
        
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedContent);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted.toString('utf8');
    } catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
}

/**
 * Processes 3 pairs of encrypted text and password.
 * Decrypts, mods by 2, and returns the sum.
 */
function processPairs(pairs) {
    let totalSum = 0;

    if (pairs.length !== 3) {
        console.log("Warning: Expected 3 pairs, but received " + pairs.length);
    }

    pairs.forEach((pair, index) => {
        try {
            // 1. Decrypt
            const decryptedString = decryptText(pair.encryptedText, pair.password);
            
            // 2. Convert to Number
            // We assume the decrypted text is a string representation of a number (e.g., "123")
            const numberValue = parseInt(decryptedString, 10);

            if (isNaN(numberValue)) {
                console.log(`Pair ${index + 1}: Decrypted text "${decryptedString}" is not a number. Skipping.`);
                return;
            }

            // 3. Mod by 2
            const modValue = numberValue % 2;

            console.log(`Pair ${index + 1}: Decrypted=${numberValue}, Mod2=${modValue}`);

            // 4. Add to Sum
            totalSum += modValue;

        } catch (error) {
            console.error(`Error processing pair ${index + 1}: ${error.message}`);
        }
    });

    return totalSum;
}

// --- Example Usage ---

// Replace these strings with your actual encrypted Base64 strings and passwords
const inputData = [
    { 
        encryptedText: "YOUR_BASE64_STRING_1_HERE", 
        password: "123" 
    },
    { 
        encryptedText: "YOUR_BASE64_STRING_2_HERE", 
        password: "456" 
    },
    { 
        encryptedText: "YOUR_BASE64_STRING_3_HERE", 
        password: "789" 
    }
];

// Run the function
const finalSum = processPairs(inputData);

console.log("--------------------------------");
console.log(`Final Sum of Mods: ${finalSum}`);