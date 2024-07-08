var express = require("express");
var router = express.Router();
const EC = require("elliptic").ec;
const ecdsa = new EC("secp256k1");
var middleware = require("../helpers/middleware");
var wallet = new (require("../models/wallet"))();
var Transaction = require('../models/transaction');
var nodeMining=require("../helpers/virtual/nodeMining");

router.get("/", middleware.isLogged, function (req, res, next) {
    let balance = blockChain.getBalanceOfAddress(req.user.publicKey),
        transactions = blockChain.getTransactionOfAddress(req.user.publicKey),
        lastestBlocks = blockChain.chain.length > 5 ? blockChain.chain.slice(blockChain.chain.length - 6, blockChain.chain.length) : blockChain.chain,
        lastestTransactions = [];
    if (lastestBlocks.length > 0) {
        for (const block of lastestBlocks) {
            for (const trans of block.transactions) {
                lastestTransactions.push(trans)
            }
        }
    }

    res.render("index", {
        isLogin: 1, balance: balance, address: req.user.publicKey, privateKey: req.user.privateKey,
        transactions: transactions, lastestBlocks: lastestBlocks, lastestTransactions: lastestTransactions,
        error: req.query.error, address: req.user.publicKey
    });
});

router.get("/login", function (req, res, next) {
    res.render("login", { error: req.query.error });
});

router.post("/login", function (req, res, next) {
    if (req.body.privateKey.length == 64) {
        res.cookie(
            "userInfo",
            {
                socketId: req.body.socketId,
                privateKey: req.body.privateKey,
                publicKey: ecdsa.keyFromPrivate(req.body.privateKey).getPublic('hex'),
            },
            { maxAge: 2147483647, httpOnly: true }
        );
        io.to(req.body.socketId).emit("registerSuccess", ecdsa.keyFromPrivate(req.body.privateKey).getPublic('hex'));
        return res.redirect("/");
    }
    res.redirect("/login?error=1");
});

router.get("/get-address", middleware.isLogged, (req, res) => {
    res.send(req.user.publicKey);
});
router.get("/logout", function (req, res, next) {
    res.clearCookie("userInfo");
    res.redirect("/login");
});

router.post("/create-wallet", (req, res) => {
    var newWallet = wallet.genenatorNewWallet();
    listNode.push(newWallet.publicKey); // list node for mining  add new node
    res.cookie(
        "userInfo",
        {
            socketId: req.body.socketId,
            publicKey: newWallet.publicKey,
            privateKey: newWallet.privateKey,
        },
        { httpOnly: true }
    );
    //res.attachment("secretfile" + Date.now() + ".txt");
    res.attachment("keystore.txt");
    res.type("txt");
    res.send(newWallet);
    io.to(req.body.socketId).emit("registerSuccess", newWallet.publicKey);
});

router.get("/create-wallet", (req, res) => {
    res.render('signup');
});

router.post("/create-transaction", middleware.isLogged, (req, res) => {
    const errors = {};
    // Kiểm tra đầu vào...
    if (!req.body.to || !req.body.amount) {
        errors.input = "Vui lòng nhập đầy đủ thông tin.";
    } else if (req.body.amount <= 0) {
        errors.amount = "Số tiền phải lớn hơn 0.";
    }

    if (Object.keys(errors).length > 0) {
        console.log('Input errors:', errors);
        return res.render("index", {
            isLogin: 1,
            errors: errors
        });
    }
    var transaction = new Transaction(req.user.publicKey, req.body.to, req.body.amount);
    try {
        transaction.signTransaction(ecdsa.keyFromPrivate(req.user.privateKey));
        console.log('Transaction signed:', transaction);
        blockChain.createTransaction(transaction);
        console.log('Transaction created:', transaction);
        nodeMining();
        console.log('Mining completed');
        res.redirect('/');
    } catch (error) {
        console.log('Error creating transaction:', error);
        res.redirect('/?error=1');
    }
});

module.exports = router;