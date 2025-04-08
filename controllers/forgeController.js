const Joi = require("joi");
const db = require("../models");
const ForgeHistory = db.forgeHistory;
const User = db.user;
const { errorHandler } = require("../utils/helper");
const { eot, dot } = require('../utils/cryptoUtils');
const { Op } = require("sequelize");

exports.getAllForge = async (req, res) => {
    try {
        const { start, length, search, order, dir } = dot(req.body);

        let query = { status: true };

        if (search && search.trim() !== "") {
            query = {
                [Op.or]: [
                    { result: { [Op.substring]: search } },
                ],
            };
        }

        const data = await ForgeHistory.findAndCountAll({
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

exports.onBetForge = async (req, res) => {
    try {
        const { userId, itemId, betAmount, multiVal, result } = dot(req.body);

        const user = await User.findOne({ where: { id: userId } });

        if (user.balance < betAmount) {
            return errorHandler(res, "Please deposit first!");
        }
        const userPrevBalance = user.balance;
        const userAfterBalance = result ? (user.balance - betAmount + betAmount * multiVal) : (user.balance - betAmount);

        await User.update({ balance: userAfterBalance }, { where: { id: user.id } });

        await ForgeHistory.create({ userId, itemId, userPrevBalance, userAfterBalance, betAmount, multi: multiVal, result: result ? "success" : "failed" });
        return res.json(eot({
            status: 1,
            msg: "success",
        }));

    } catch (error) {
        return errorHandler(res, error);
    }
};

