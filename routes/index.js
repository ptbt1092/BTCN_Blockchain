const express = require('express');
const router = express.Router();
const Blockchain = require('../models/blockchain');
const Validator = require('../models/validator');
const EC = require('elliptic').ec;
const ecdsa = new EC('secp256k1');

const blockchain = new Blockchain();

router.get('/', (req, res) => {
    res.render('home', { blockchain: JSON.stringify(blockchain, null, 2) });
});

router.post('/stake', (req, res) => {
    const { privateKey, amount } = req.body;
    const key = ecdsa.keyFromPrivate(privateKey);
    const address = key.getPublic('hex');
    let validator = blockchain.validators.find(v => v.address === address);
    if (!validator) {
        validator = new Validator(address, 0);
        blockchain.addValidator(validator);
    }
    validator.addStake(amount);
    res.send(`Staked ${amount} to address ${address}`);
});

router.post('/create-block', (req, res) => {
    blockchain.stakeNewBlock();
    res.send('New block created');
});

router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = router;
