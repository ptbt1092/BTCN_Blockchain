const Block = require('./block');
const Transaction = require('./transaction');
const configFirstBlock = require('../config/first-block');
const EC = require('elliptic').ec;
const ecdsa = new EC('secp256k1');

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.validators = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        const { privateKey, publicKey, totalTChain, timeStamp } = configFirstBlock;
        return new Block(timeStamp, [new Transaction(null, publicKey, totalTChain)], "");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    createTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            console.log('Transaction must include from and to address');
            throw new Error('Transaction must include from and to address');
        }
        if (!transaction.isValid()) {
            console.log('Cannot add invalid transaction to chain');
            throw new Error('Cannot add invalid transaction to chain');
        }
        this.pendingTransactions.push(transaction);
        console.log('Transaction added to pending transactions:', transaction);
    }

    addValidator(validator) {
        this.validators.push(validator);
    }

    chooseValidator() {
        let totalStake = this.validators.reduce((sum, validator) => sum + validator.stake, 0);
        console.log('Total stake:', totalStake);
        let random = Math.floor(Math.random() * totalStake);
        console.log('Random value:', random);
        let currentStake = 0;

        for (let validator of this.validators) {
            currentStake += validator.stake;
            console.log(`Current stake: ${currentStake}, Validator: ${validator.address}`);
            if (currentStake > random) {
                console.log('Validator chosen:', validator);
                return validator;
            }
        }
        console.log('No validator chosen');
        return null;
    }

    createNewBlock(validator) {
        console.log('Creating new block...');
        const rewardTx = new Transaction(null, validator.address, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.hash = block.calculateHash();

        console.log('Block successfully created:', block);
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    stakeNewBlock() {
        console.log('Staking new block...');
        const validator = this.chooseValidator();
        if (validator) {
            console.log('Validator chosen:', validator);
            this.createNewBlock(validator);
        } else {
            console.log('No validators available');
        }
    }

    miningPendingTransactions(miningRewardAddress) {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.hash = block.calculateHash();
        this.chain.push(block);

        this.pendingTransactions = [];
        console.log('Block successfully mined!');
    }

    getBalanceOfAddress(address) {
        let balance = 0;
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= parseFloat(trans.amount);
                }
                if (trans.toAddress === address) {
                    balance += parseFloat(trans.amount);
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

    getTransactionOfAddress(address) {
        let transactions = [];
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress == address || trans.toAddress == address) {
                    transactions.push(trans);
                }
            }
        }
        return transactions.length > 0 ? transactions : null;
    }

    getListPendingTransactions() {
        return this.pendingTransactions;
    }
}

module.exports = Blockchain;
