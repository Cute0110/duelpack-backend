const Joi = require("joi");
const db = require("../models");
const Cart = db.cart;
const User = db.user;
const Item = db.item;
const PackItemConnectInfo = db.packItemConnectInfo;
const { errorHandler, validateSchema } = require("../utils/helper");
const { eot, dot } = require('../utils/cryptoUtils');
const Sequelize = require("sequelize");
const { Op } = require("sequelize");

exports.getAllItems = async (req, res) => {
    try {
        const { userId } = dot(req.body);

        const data = await Cart.findAndCountAll({
            where: { userId },
            order: [
                ["id", "asc"],
            ],
            include: [
                {
                    model: db.user,
                    as: 'user',
                },
                {
                    model: db.item,
                    as: 'item',
                },
            ],
        });

        return res.json(eot({
            status: 1,
            msg: "success",
            data: data.rows,
            count: data.count,
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};
exports.sellItems = async (req, res) => {
    try {
        const { ids, price, userId } = dot(req.body);

        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.json(eot({
                status: 0,
                msg: "Invalid User!",
            }));
        }
        
        for (let i = 0; i < ids.length; i++) {
            await Cart.destroy({where: { id: ids[i] }});
        }

        await User.update({balance: user.balance + price}, { where: {id: userId}})

        const data = await Cart.findAndCountAll({
            where: { userId },
            order: [
                ["id", "asc"],
            ],
            include: [
                {
                    model: db.user,
                    as: 'user',
                },
                {
                    model: db.item,
                    as: 'item',
                },
            ],
        });

        return res.json(eot({
            status: 1,
            msg: "success",
            data: data.rows,
            count: data.count,
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};