const express = require('express');
const dotenv = require('dotenv');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
dotenv.config();

app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});