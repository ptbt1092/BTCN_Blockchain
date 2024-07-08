const SHA256 = require("crypto-js/sha256");
const EC = require('elliptic').ec;
const ecdsa = new EC('secp256k1');
class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = Date.now();
    }
    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            console.log('You cannot sign transactions for other wallets!');
            throw new Error('You cannot sign transactions for other wallets!');
        }
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
        console.log('Transaction signed:', this.signature);
    }

    isValid() {
        if (this.fromAddress === null) return true;
        if (!this.signature || this.signature.length === 0) {
            console.log('No signature in this transaction');
            throw new Error('No signature in this transaction');
        }
        const publicKey = ecdsa.keyFromPublic(this.fromAddress, 'hex');
        const isValid = publicKey.verify(this.calculateHash(), this.signature);
        console.log('Transaction is valid:', isValid);
        return isValid;
    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp).toString();
    }
}
module.exports = Transaction;
