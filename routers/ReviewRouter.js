const express = require('express');

const { Reviwes, getReviews  } = require('../controllers/ReviweControl.js');


const ReviewRouterClient = express.Router();

ReviewRouterClient.post('/review', Reviwes);

ReviewRouterClient.get('/review', getReviews);

module.exports = ReviewRouterClient;

