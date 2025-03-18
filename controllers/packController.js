const Joi = require("joi");
const db = require("../models");
const Pack = db.pack;
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
        
        query = { ...query, status: true};

        const data = await Pack.findAndCountAll({
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
            count: data.count,
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

exports.getPackItems = async (req, res) => {
    try {
        const { start, length, search, order, dir, packID } = dot(req.body);

        let query = {};

        if (search && search.trim() !== "") {
            query = {
                [Op.or]: [
                    { name: { [Op.substring]: search } },
                ],
            };
        }

        query = {...query, packId : packID, status: true};

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

        console.log(data.rows);

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

