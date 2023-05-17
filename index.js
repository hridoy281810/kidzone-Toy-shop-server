const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.POST || 5000;


app.use('/', (req,res))