const Joi = require("joi");
const db = require("../models");
const Pack = db.pack;
const User = db.user;
const Cart = db.cart;
const Item = db.item;
const PackItemConnectInfo = db.packItemConnectInfo;
const { errorHandler, validateSchema } = require("../utils/helper");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const config = require("../config/main");
const { eot, dot } = require('../utils/cryptoUtils');
const Sequelize = require("sequelize");
const { Op } = require("sequelize");

exports.getAllItems = async (req, res) => {
    try {
        const { start, length, search, order, dir, maxPrice } = dot(req.body);
        let query = { status: true }; // Start with the status condition

        // Add search condition if provided
        if (search && search.trim() !== "") {
            query.name = { [Op.substring]: search }; // Directly assign the substring condition to 'name'
        }
        
        // Add price condition if maxPrice is not zero
        if (maxPrice && maxPrice !== 0) {
            query.price = { [Op.lte]: maxPrice };
        }

        const data = await Item.findAndCountAll({
            where: query,
            offset: Number(start),
            limit: length == 0 ? null : Number(length),
            order: [
                [order, dir],
            ],
        });

        return res.json(eot({
            status: 1,
            msg: "success",
            data: data.rows,
            length: Number(length),
            start: Number(start),
            totalCount: data.count,
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

