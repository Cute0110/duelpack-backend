const Joi = require("joi");
const db = require("../models");
const ForgeHistory = db.forgeHistory;
const User = db.user;
const Affiliate = db.affiliate;
const { errorHandler } = require("../utils/helper");
const { eot, dot } = require('../utils/cryptoUtils');
const { Op } = require("sequelize");
const config = require('../config/main');

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

        await User.update({ balance: userAfterBalance, totalWager: (user.totalWager + betAmount) }, { where: { id: user.id } });
        await ForgeHistory.create({ userId, itemId, userPrevBalance, userAfterBalance, betAmount, multi: multiVal, result: result ? "success" : "failed" });
        
        const affiliate = await Affiliate.findOne({ where: {userId}});

        if (affiliate) {
            const refer = await User.findOne({ where: { id: affiliate.referId } });
            const bonusVal = betAmount / config.affiliateBonusPercent;
            await User.update({totalEarning: refer.totalEarning + bonusVal, unClaimEarning: refer.unClaimEarning + bonusVal}, {where: {id: refer.id}})
        }

        return res.json(eot({
            status: 1,
            msg: "success",
        }));

    } catch (error) {
        return errorHandler(res, error);
    }
};

