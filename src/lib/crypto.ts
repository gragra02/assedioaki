/**
 * Web Crypto API utilities for End-to-End Client-side Encryption (E2EE)
 * Encrypts sensitive data using AES-GCM 256-bit before local or server storage.
 */

export async function generateSHA256Hash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function deriveKeyFromSecret(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data: string, secretKey: string): Promise<{ ciphertext: string; iv: string; salt: string; hash: string }> {
  try {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    
    // Generate random Salt and IV
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const derivedKey = await deriveKeyFromSecret(secretKey, salt);
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      derivedKey,
      encodedData
    );

    const ciphertext = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
    const ivBase64 = btoa(String.fromCharCode(...iv));
    const saltBase64 = btoa(String.fromCharCode(...salt));
    const hash = await generateSHA256Hash(ciphertext);

    return {
      ciphertext,
      iv: ivBase64,
      salt: saltBase64,
      hash
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Falha na criptografia de ponta a ponta.');
  }
}

export async function decryptData(encryptedObj: { ciphertext: string; iv: string; salt: string }, secretKey: string): Promise<string> {
  try {
    const ciphertextBytes = Uint8Array.from(atob(encryptedObj.ciphertext), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(encryptedObj.iv), c => c.charCodeAt(0));
    const salt = Uint8Array.from(atob(encryptedObj.salt), c => c.charCodeAt(0));

    const derivedKey = await deriveKeyFromSecret(secretKey, salt);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      derivedKey,
      ciphertextBytes
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Chave de acesso incorreta ou dados corrompidos.');
  }
}
