const crypto = require('crypto');
const { algorithm, iv, encryptionKey } = require("../config")

const encrypt = (text) => {

    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

const decrypt = (jsonHash) => {
    const hash = JSON.parse(jsonHash)
    const decipher = crypto.createDecipheriv(algorithm, encryptionKey, Buffer.from(hash.iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

    return decrpyted.toString();
};

module.exports = {
    encrypt,
    decrypt
};
