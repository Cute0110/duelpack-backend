const Joi = require("joi");
const db = require("../models");
const Pack = db.pack;
const User = db.user;
const Cart = db.cart;
const Affiliate = db.affiliate;
const BuyPackHistory = db.buyPackHistory;
const PackItemConnectInfo = db.packItemConnectInfo;
const { errorHandler, validateSchema } = require("../utils/helper");
const { eot, dot } = require('../utils/cryptoUtils');
const { Op } = require("sequelize");
const config = require('../config/main');

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

        query = { ...query, type: 1, status: true };

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

exports.getAllFreePacks = async (req, res) => {
    try {
        const { start, length, search, order, dir } = dot(req.body);

        let query = {};

        if (search && search.trim() !== "") {
            query = {
                name: { [Op.substring]: search },
            };
        }

        query = { ...query, type: {[Op.in]: [2, 3]}, status: true };

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

exports.getSideSliderPackItems = async (req, res) => {
    try {
        const { count } = dot(req.body);

        const data = await PackItemConnectInfo.findAll({
            where: {
                rarity: {
                    [Op.gt]: 2, // age > 30
                },
            },
            order: db.sequelize.random(), // or Sequelize.literal('RAND()') for MySQL
            limit: count,
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
            data,
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

const getRemainingTimeOrExpired = (oldTime) => {
    const oneDayMs = 24 * 60 * 60 * 1000;
    const targetTime = new Date(new Date(oldTime).getTime() + oneDayMs);
    const now = new Date();

    const diffMs = targetTime - now;

    if (diffMs <= 0) {
        return 'Spin Now';
    }

    const hours = String(Math.floor(diffMs / (1000 * 60 * 60)) % 24).padStart(2, '0');
    const minutes = String(Math.floor(diffMs / (1000 * 60)) % 60).padStart(2, '0');
    const seconds = String(Math.floor(diffMs / 1000) % 60).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

exports.buyItems = async (req, res) => {
    try {
        const { packIds, itemIds, userId, payAmount, packType } = dot(req.body);

        const user = await User.findOne({ where: { id: userId } });

        if (user.balance < payAmount) {
            return errorHandler(res, "Please deposit first!");
        }
        
        if (packType == 2) {
            const remainTime = getRemainingTimeOrExpired(user.lastFirstPackSpinTime);
            if (remainTime != "Spin Now") {
                return errorHandler(res, "This is not spin time!");
            } else {
                const now = new Date();
                await User.update({ lastFirstPackSpinTime: now }, { where: { id: user.id } });
            }
        } else if (packType == 3) {
            if (user.totalDeposit == 0) {
                return errorHandler(res, "You are not allowed to this spin!");
            } else {
                const remainTime = getRemainingTimeOrExpired(user.lastSecondPackSpinTime);
                if (remainTime != "Spin Now") {
                    return errorHandler(res, "This is not spin time!");
                }  else {
                    const now = new Date();
                    await User.update({ lastSecondPackSpinTime: now }, { where: { id: user.id } });
                }
            }
        }

        const userPrevBalance = user.balance;
        const userAfterBalance = user.balance - payAmount;

        await User.update({ balance: userAfterBalance, totalWager: (user.totalWager + payAmount) }, { where: { id: user.id } });

        let temp = "";

        for (let i = 0; i < packIds.length; i++) {
            temp += (packIds[i] + '-' + itemIds[i] + ',');
        }

        await BuyPackHistory.create({ userId, packItemIds: temp, userPrevBalance, userAfterBalance })

        for (let i = 0; i < itemIds.length; i++) {
            if (itemIds[i] != config.halfPackItemId) {
                await Cart.create({ userId, itemId: itemIds[i] });
            }
            else {
                const pack = await Pack.findOne({where: {id: packIds[i]}});
                await User.update({ balance: (userAfterBalance + pack.price / 2), totalWager: (user.totalWager + payAmount) }, { where: { id: user.id } });
            }
        }

        const affiliate = await Affiliate.findOne({ where: { userId } });

        if (affiliate) {
            const refer = await User.findOne({ where: { id: affiliate.referId } });
            if (refer) {
                const bonusVal = payAmount / config.affiliateBonusPercent;
                await User.update({ totalEarning: refer.totalEarning + bonusVal, unClaimEarning: refer.unClaimEarning + bonusVal }, { where: { id: refer.id } })
            }
        }

        return res.json(eot({
            status: 1,
            msg: "success",
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};


