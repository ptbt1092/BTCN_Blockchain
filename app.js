const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const indexRouter = require('./routes/index');
const app = express();
const port = 3000;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', indexRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
