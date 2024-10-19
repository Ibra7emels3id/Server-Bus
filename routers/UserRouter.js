const express = require('express');
const { userControl } = require('../controllers/userControls');

const userRouter = express.Router();

userRouter.post('/user/Login', userControl)
userRouter.post('/user/signup', userControl)

module.exports = userRouter;
