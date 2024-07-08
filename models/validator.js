class Validator {
    constructor(address, stake) {
        this.address = address;
        this.stake = stake;
    }

    addStake(amount) {
        this.stake += amount;
    }

    reduceStake(amount) {
        if (this.stake >= amount) {
            this.stake -= amount;
        } else {
            throw new Error('Insufficient stake');
        }
    }
}

module.exports = Validator;
