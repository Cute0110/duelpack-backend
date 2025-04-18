const Joi = require("joi");
const db = require("../models");
const User = db.user;
const UserBalanceHistory = db.userBalanceHistory;
const { errorHandler } = require("../utils/helper");
const { eot, dot } = require('../utils/cryptoUtils');
const config = require('../config/main');
const jwt = require('jsonwebtoken');
const { client } = require('../utils/paypalPayment');
const paypal = require('@paypal/checkout-server-sdk');

const axios = require("axios");
exports.createOrder = async (req, res) => {
    const { user_id, order_price } = dot(req.body);
    try {
        const PaypalClient = client()
        //This code is lifted from https://github.com/paypal/Checkout-NodeJS-SDK
        const request = new paypal.orders.OrdersCreateRequest()
        request.headers['prefer'] = 'return=representation'
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: order_price + "",
                    },
                },
            ],
            application_context: {    
                shipping_preference: "NO_SHIPPING", // ✅ Removes shipping fields
                user_action: "PAY_NOW", // ✅ Prevents unnecessary steps
                payment_method: {
                  payer_selected: "PAYPAL",
                  payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
                },
            }
        })
        const response = await PaypalClient.execute(request)
        if (response.statusCode !== 201) {
            console.log("RES: ", response)
            errorHandler(res, "Some Error Occured at backend");
        }

        const authHeader = req.headers.authorization;
        if (!authHeader) return res.json(eot({ status: 0, msg: 'No token provided' }));

        const token = authHeader;
        const decoded = jwt.verify(token, config.SECRET_KEY);

        const user = await User.findOne({ where: { id: decoded.userId } });

        if (!user) {
            return res.json(eot({ status: 0, msg: 'Invalid user!' }));
        }

        const newUserBalanceHistory = await UserBalanceHistory.create({ orderId: response.result.id, userId: decoded.userId, userPrevBalance: user.balance, userAfterBalance: user.balance, sentAmount: order_price, type: "Payapl | Deposit", status: "Waiting" });

        res.status(200).json(eot({ success: true, orderId: response.result.id }))
    }
    catch (err) {
        console.log("Err at Create Order: ", err)
        errorHandler(res, "Could Not Found the user");
    }
};

exports.captureOrder = async (req, res) => {
    const { orderID } = dot(req.body);

    if (!orderID)
        errorHandler(res, "Please Provide Order ID");
    const PaypalClient = client()
    const request = new paypal.orders.OrdersCaptureRequest(orderID)
    request.requestBody({})
    const response = await PaypalClient.execute(request)
    if (!response) {
        errorHandler(res, "Some Error Occured at backend");
    }
    // Your Custom Code to Update Order Status
    // And Other stuff that is related to that order, like wallet
    // Here I am updateing the wallet and sending it back to frontend to update it on frontend
    if (response?.result?.status === "COMPLETED") {
        depositAmount = response.result.purchase_units[0].payments.captures[0].amount.value;
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.json(eot({ status: 0, msg: 'No token provided' }));
    
        const token = authHeader;
        const decoded = jwt.verify(token, config.SECRET_KEY);
    
        const user = await User.findOne({ where: { id: decoded.userId } });
    
        if (!user) {
            return res.json(eot({ status: 0, msg: 'Invalid user!' }));
        }
    
        const nub = await UserBalanceHistory.findOne({ where: {orderId: orderID}});
        const newBalance = (user.balance + Number(depositAmount));
    
        await User.update({ balance: newBalance, totalDeposit: (user.totalDeposit + Number(depositAmount)) }, { where: { id: user.id } });
        await UserBalanceHistory.update({ userPrevBalance: user.balance, userAfterBalance: newBalance, receivedAmount: Number(depositAmount), status: "Finished" }, {where: {id: nub.id}});
    
        return res.status(200).json(eot({ success: true, data: response, newBalance: newBalance }))
    } else {
        errorHandler(res, "Deposit failed!")
    }

}