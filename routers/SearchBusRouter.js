const express = require('express');
const { SearchBus } = require('../controllers/SearchBusControl');

const SearchRouter = express.Router();

SearchRouter.post('/listBus', SearchBus)

module.exports = SearchRouter;
