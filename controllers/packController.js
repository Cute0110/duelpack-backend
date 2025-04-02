const Joi = require("joi");
const db = require("../models");
const Pack = db.pack;
const User = db.user;
const Cart = db.cart;
const PackItemConnectInfo = db.packItemConnectInfo;
const { errorHandler, validateSchema } = require("../utils/helper");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const config = require("../config/main");
const { eot, dot } = require('../utils/cryptoUtils');
const Sequelize = require("sequelize");
const { Op } = require("sequelize");

exports.getAllPacks = async (req, res) => {
    try {
        const { start, length, search, order, dir } = dot(req.body);

        let query = {};

        if (search && search.trim() !== "") {
            query = {
                [Op.or]: [
                    { name: { [Op.substring]: search } },
                ],
            };
        }

        query = { ...query, status: true };

        const data = await Pack.findAndCountAll({
            where: query,
            offset: Number(start),
            limit: length == 0 ? null : Number(length),
            order: [
                [order, dir],
            ],
        });

        const packItemConnectInfoCount = await PackItemConnectInfo.count();

        return res.json(eot({
            status: 1,
            msg: "success",
            data: data.rows,
            length: Number(length),
            start: Number(start),
            totalCount: data.count,
            packItemConnectInfoCount: packItemConnectInfoCount
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

exports.getPackItems = async (req, res) => {
    try {
        const { start, length, search, order, dir, packId } = dot(req.body);

        let query = {};

        if (search && search.trim() !== "") {
            query = {
                [Op.or]: [
                    { name: { [Op.substring]: search } },
                ],
            };
        }

        query = { ...query, packId, status: true };

        const data = await PackItemConnectInfo.findAndCountAll({
            where: query,
            offset: Number(start),
            limit: length == 0 ? null : Number(length),
            order: [[order, dir]], // Ordering by item.id
            include: [
                {
                    model: db.pack,
                    as: 'pack',
                },
            ],
            include: [
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
            length: Number(length),
            start: Number(start),
            count: data.count,
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

exports.getPackItemsAll = async (req, res) => {
    try {
        const { start, length, search, order, dir } = dot(req.body);

        let query = {};

        if (search && search.trim() !== "") {
            query = {
                [Op.or]: [
                    { name: { [Op.substring]: search } },
                ],
            };
        }

        query = { ...query, status: true };

        const data = await PackItemConnectInfo.findAndCountAll({
            where: query,
            offset: Number(start),
            limit: length == 0 ? null : Number(length),
            order: [[order, dir]], // Ordering by item.id
            include: [
                {
                    model: db.pack,
                    as: 'pack',
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
            length: Number(length),
            start: Number(start),
            count: data.count,
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

exports.buyItems = async (req, res) => {
    try {
        const { itemIds, userId, payAmount } = dot(req.body);

        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.json(eot({
                status: 0,
                msg: "Invalid User!",
            }));
        }

        if (user.balance < payAmount) {
            return res.json(eot({
                status: 0,
                msg: "You should deposite first!",
            }));
        }

        for (let i = 0; i < itemIds.length; i++) {
            const newCart = await Cart.create({ userId, itemId: itemIds[i] });
        }

        await User.update({ balance: user.balance - payAmount }, { where: { id: user.id } });

        return res.json(eot({
            status: 1,
            msg: "success",
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};


