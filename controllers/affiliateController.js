const Joi = require("joi");
const db = require("../models");
const Affiliate = db.affiliate;
const User = db.user;
const Item = db.item;
const PackItemConnectInfo = db.packItemConnectInfo;
const { errorHandler, validateSchema } = require("../utils/helper");
const { eot, dot } = require('../utils/cryptoUtils');
const Sequelize = require("sequelize");
const { Op } = require("sequelize");

exports.getUserAffiliate = async (req, res) => {
    try {
        const { userId, start, length } = dot(req.body);

        const tableData = await Affiliate.findAndCountAll({
            where: {referId: userId},
            offset: Number(start),
            limit: length == 0 ? null : Number(length),
            include: [
                {
                    model: db.user,
                    as: 'user',
                },
                {
                    model: db.user,
                    as: 'refer',
                },
            ],
        });

        const data = await Affiliate.findAndCountAll({
            where: { referId: userId },
            include: [
                {
                    model: db.user,
                    as: 'user',
                },
                {
                    model: db.user,
                    as: 'refer',
                },
            ],
        });

        const totalDepositSum = data.rows.reduce((sum, affiliate) => {
            const deposit = affiliate.user?.totalDeposit || 0;
            return sum + deposit;
        }, 0);
        
        const totalWagerSum = data.rows.reduce((sum, affiliate) => {
            const deposit = affiliate.user?.totalWager || 0;
            return sum + deposit;
        }, 0);

        return res.json(eot({
            status: 1,
            msg: "success",
            tableData: tableData.rows,
            totalUsersCount: data.count,
            totalDepositSum,
            totalWagerSum,
            length: Number(length),
            start: Number(start),
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};