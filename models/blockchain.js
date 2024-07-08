const Block = require('./block');
const Transaction = require('./transaction');
const Validator = require('./validator');
const EC = require('elliptic').ec;
const ecdsa = new EC('secp256k1');

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 1;
        this.pendingTransactions = [];
        this.miningReward = 1;
        this.validators = [];
    }

    createGenesisBlock() {
        return new Block(Date.parse('2021-01-01'), [], '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    createTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }
        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }
        this.pendingTransactions.push(transaction);
    }

    addValidator(validator) {
        this.validators.push(validator);
    }

    chooseValidator() {
        let totalStake = this.validators.reduce((sum, validator) => sum + validator.stake, 0);
        let random = Math.floor(Math.random() * totalStake);
        let currentStake = 0;

        for (let validator of this.validators) {
            currentStake += validator.stake;
            if (currentStake > random) {
                return validator;
            }
        }
        return null;
    }

    createNewBlock(validator) {
        const rewardTx = new Transaction(null, validator.address, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.hash = block.calculateHash();

        console.log('Block successfully created!');
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    stakeNewBlock() {
        const validator = this.chooseValidator();
        if (validator) {
            this.createNewBlock(validator);
        } else {
            console.log('No validators available');
        }
    }

    getBalanceOfAddress(address) {
        let balance = 0;
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }
                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }
        }
        return true;
    }
}

module.exports = Blockchain;
