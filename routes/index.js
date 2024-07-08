const express = require('express');
const router = express.Router();
const Blockchain = require('../models/blockchain');
const Validator = require('../models/validator');
const EC = require('elliptic').ec;
const ecdsa = new EC('secp256k1');
const bodyParser = require('body-parser');

const blockchain = new Blockchain();

router.use(bodyParser.json());

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

router.get('/', (req, res) => {
    res.send(blockchain);
});

module.exports = router;
