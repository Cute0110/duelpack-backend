const Joi = require("joi");
const db = require("../models");
const Forge = db.forge;
const User = db.user;
const { errorHandler, validateSchema } = require("../utils/helper");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const config = require("../config/main");
const { eot, dot } = require('../utils/cryptoUtils');
const Sequelize = require("sequelize");
const { Op } = require("sequelize");

exports.getAllForge = async (req, res) => {
    try {
        const { start, length, search, order, dir } = dot(req.body);

        console.log(start, length, search)
        let query = {};

        if (search && search.trim() !== "") {
            query = {
                [Op.or]: [
                    { name: { [Op.substring]: search } },
                ],
            };
        }

        const data = await Forge.findAndCountAll({
            where: query,
            offset: Number(start),
            limit: length == 0 ? null : Number(length),
            order: [
                [order, dir],
            ],
            include: [
                {
                    model: db.user,
                    as: 'user',
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

