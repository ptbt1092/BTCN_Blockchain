// Sử dụng thư viện elliptic để tạo khóa riêng và khóa công khai
const EC = require('elliptic').ec;
const ecdsa = new EC('secp256k1');

// Tạo khóa mới
const key = ecdsa.genKeyPair();
const privateKey = key.getPrivate('hex');
const publicKey = key.getPublic('hex');
console.log(privateKey);
console.log(publicKey);

// Các giá trị mặc định ban đầu
const totalTChain = 1000000;
const timeStamp = Date.now(); 

module.exports = {
    privateKey,
    publicKey,
    totalTChain,
    timeStamp
}
