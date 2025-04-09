const Joi = require("joi");
const db = require("../models");
const User = db.user;
const UserBetInfo = db.userBetInfo;
const Influencer = db.influencer;
const UserBalanceHistory = db.userBalanceHistory;
const { errorHandler, validateSchema } = require("../utils/helper");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const config = require("../config/main");
const { eot, dot } = require('../utils/cryptoUtils');
const Sequelize = require("sequelize");
const { Op } = require("sequelize");

const generateRandomString = (length = 25) => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    array.forEach((byte) => {
        result += chars[byte % chars.length];
    });
    return result;
};

exports.register = async (req, res) => {
    try {
        const { emailAddress, password } = dot(req.body);
        let ipAddress = "127.0.0.1";
        const schema = Joi.object().keys({
            emailAddress: Joi.string().required(),
            password: Joi.string().required(),
        });

        if (req.headers["host"].startsWith("localhost")) {
            ipAddress = "localhost";
        } else {
            ipAddress = req.headers["x-forwarded-for"].split(",")[0];
        }

        if (!validateSchema(res, dot(req.body), schema)) {
            return;
        }

        const user = await User.findOne({ where: { emailAddress } });
        if (user) {
            return res.json(eot({
                status: 0,
                msg: "Email already exist!",
            }));
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({ emailAddress, password: hashedPassword, ipAddress });

        const userCode = generateRandomString() + newUser.id;
        const userName = "duelpack_" + newUser.id;
        await User.update({ userCode, userName }, { where: { id: newUser.id } })

        return res.json(eot({
            status: 1,
            msg: "Register success!",
            result: newUser,
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

exports.login = async (req, res) => {
    try {
        const { emailAddress, password } = dot(req.body);

        const schema = Joi.object().keys({
            emailAddress: Joi.string().required(),
            password: Joi.string().required(),
        });

        if (!validateSchema(res, dot(req.body), schema)) {
            return;
        }

        const user = await User.findOne({ where: { emailAddress } });

        if (!user) {
            return res.json(eot({
                status: 0,
                msg: "Email does not exist!",
            }))
        }

        if (user.status == 0) {
            return res.json(eot({
                status: 0,
                msg: "You were blocked by admin!",
            }))
        }

        const result = await bcrypt.compare(password, user.password);
        if (!result) {
            return res.json(eot({
                status: 0,
                msg: "Password is incorrect!",
            }));
        }

        const userData = {
            id: user.id,
            emailAddress: user.emailAddress,
            userCode: user.userCode,
            userName: user.userName,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            residentialAddress: user.residentialAddress,
            balance: user.balance,
            avatarURL: user.avatarURL
        };

        const token = jwt.sign({ userId: user.id, userCode: user.userCode }, config.SECRET_KEY, { expiresIn: '1d' });
        return res.json(eot({ status: 1, msg: "Login success!", token, userData }));
    } catch (error) {
        return errorHandler(res, error);
    }
};


exports.google_login = async (req, res) => {
    try {
        const { emailAddress, password } = dot(req.body);

        // const schema = Joi.object().keys({
        //     emailAddress: Joi.string().required(),
        // });

        // if (!validateSchema(res, dot(req.body), schema)) {
        //     return;
        // }

        const user = await User.findOne({ where: { emailAddress } });

        if (!user) {
            let ipAddress = "127.0.0.1";

            if (req.headers["host"].startsWith("localhost")) {
                ipAddress = "localhost";
            } else {
                ipAddress = req.headers["x-forwarded-for"].split(",")[0];
            }

            const saltRounds = 10;

            const newUser = await User.create({ emailAddress, ipAddress });

            const userCode = generateRandomString() + newUser.id;
            const userName = "duelpack_" + newUser.id;
            await User.update({ userCode, userName }, { where: { id: newUser.id } });

            const userData = {
                id: newUser.id,
                emailAddress: emailAddress,
                userCode: userCode,
                userName: userName,
                fullName: newUser.fullName,
                phoneNumber: newUser.phoneNumber,
                residentialAddress: newUser.residentialAddress,
                balance: newUser.balance,
                avatarURL: newUser.avatarURL
            };

            const token = jwt.sign({ userId: newUser.id, userCode: userCode }, config.SECRET_KEY, { expiresIn: '1d' });
            return res.json(eot({ status: 1, msg: "Login success!", token, userData }));
        } else {
            if (user.status == 0) {
                return res.json(eot({
                    status: 0,
                    msg: "You were blocked by admin!",
                }))
            }
            const userData = {
                id: user.id,
                emailAddress: user.emailAddress,
                userCode: user.userCode,
                userName: user.userName,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                residentialAddress: user.residentialAddress,
                balance: user.balance,
                avatarURL: user.avatarURL
            };

            const token = jwt.sign({ userId: user.id, userCode: user.userCode }, config.SECRET_KEY, { expiresIn: '1d' });
            return res.json(eot({ status: 1, msg: "Login success!", token, userData }));
        }
        return;
    } catch (error) {
        return errorHandler(res, error);
    }
};

exports.changeUserPassword = async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = dot(req.body);

        // Find user
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.json(eot({
                status: 0,
                msg: "User not found"
            }));
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.json(eot({
                status: 0,
                msg: "Current password is incorrect"
            }));
        }

        // Hash and update new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await User.update(
            { password: hashedPassword },
            { where: { id: userId } }
        );

        return res.json(eot({
            status: 1,
            msg: "Password updated successfully"
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

exports.resetUserPassword = async (req, res) => {
    try {
        const { userId } = dot(req.body);

        // Find user
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.json(eot({
                status: 0,
                msg: "User not found"
            }));
        }

        // Hash and update new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash("123456", saltRounds);

        await User.update(
            { password: hashedPassword },
            { where: { id: userId } }
        );

        return res.json(eot({
            status: 1,
            msg: "Password updated successfully"
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

exports.getUserDepositHistory = async (req, res) => {
    try {
        const { start, length, search, order, dir, userId } = dot(req.body);

        let query = {userId, status: "Finished"};

        if (search && search.trim() !== "") {
            query = {
                [Op.or]: [
                    { name: { [Op.substring]: search } },
                    { promoCode: { [Op.substring]: search } }
                ],
            };
        }

        query = {
            ...query,
            type: { [Op.substring]: "Deposit" },
        }

        const data = await UserBalanceHistory.findAndCountAll({
            include: [{
                model: User,
                as: "user",
                attributes: ['id', 'userCode', 'userName', 'emailAddress'],
            }],
            where: query,
            offset: Number(start),
            limit: Number(length),
            order: [
                [order, dir],
            ],
        });

        return res.json(eot({
            status: 1,
            data: data.rows,
            length: Number(length),
            start: Number(start),
            totalCount: data.count,
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

exports.getUserWithdrawHistory = async (req, res) => {
    try {
        const { start, length, search, order, dir, userId } = dot(req.body);

        let query = {userId, status: "Finished"};

        if (search && search.trim() !== "") {
            query = {
                [Op.or]: [
                    { name: { [Op.substring]: search } },
                    { promoCode: { [Op.substring]: search } }
                ],
            };
        }

        query = {
            ...query,
            type: { [Op.substring]: "Withdraw" },
        }

        const data = await UserBalanceHistory.findAndCountAll({
            include: [{
                model: User,
                as: "user",
                attributes: ['id', 'userCode', 'userName', 'emailAddress'],
            }],
            where: query,
            offset: Number(start),
            limit: Number(length),
            order: [
                [order, dir],
            ],
        });

        return res.json(eot({
            status: 1,
            data: data.rows,
            length: Number(length),
            start: Number(start),
            totalCount: data.count,
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

exports.userTransaction = async (req, res) => {
    try {
        const { id, newBalance, amount, chargeType } = dot(req.body);

        const userPrevBalance = (chargeType == 0 ? newBalance + amount : newBalance - amount);

        const user = await User.update({ balance: newBalance }, { where: { id } })

        await UserBalanceHistory.create({
            userId: id, type: chargeType == 0 ? "Manager | WithDraw" : "Manager | Deposit",
            userPrevBalance,
            userAfterBalance: newBalance,
            sentAmount: amount,
            receivedAmount: amount,
            status: "Finished"
        });

        return res.json(eot({
            status: 1,
            msg: "success"
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

exports.onSaveProfile = async (req, res) => {
    try {
        const { userInfo } = dot(req.body);
        await User.update({ userName: userInfo.userName, fullName: userInfo.fullName }, { where: { id: userInfo.userId } });
        return res.json(eot({
            status: 1,
            msg: "success"
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

exports.userBalanceChange = async (req, res) => {
    try {
        const { id, priceAmount } = dot(req.body);
        const user = await User.findOne({ where: { id } });

        await User.update({ balance: user.balance + priceAmount }, { where: { id } });
        return res.json(eot({
            status: 1,
            msg: "success"
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

exports.checkSession = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.json(eot({ status: 0, msg: 'No token provided' }));
        }

        const token = authHeader;
        const decoded = jwt.verify(token, config.SECRET_KEY);

        const user = await User.findOne({ where: { id: decoded.userId } });

        if (!user) {
            return res.json(eot({ status: 0, msg: 'Invalid or expired token' }));
        }
        if (user.status == 0) {
            return res.json(eot({
                status: 0,
                msg: "You were blocked by admin!",
            }))
        }

        const userData = {
            id: user.id,
            emailAddress: user.emailAddress,
            userCode: user.userCode,
            userName: user.userName,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            residentialAddress: user.residentialAddress,
            balance: user.balance,
            avatarURL: user.avatarURL
        };

        return res.json(eot({ status: 1, msg: 'Access granted', userData }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const { start, length, search, order, dir } = dot(req.body);

        let query = {};

        if (search && search.trim() !== "") {
            query = {
                [Op.or]: [
                    { userCode: { [Op.substring]: search } },
                    { emailAddress: { [Op.substring]: search } }
                ],
            };
        }

        query = {
            [Op.and]: [
                query,
                { userCode: { [Op.notIn]: config.admins } }
            ]
        };

        const data = await User.findAndCountAll({
            where: query,
            offset: Number(start),
            limit: Number(length),
            order: [
                [order, dir],
            ],
            raw: true,
            nest: true,
        });

        return res.json(eot({
            status: 1,
            data: data.rows,
            length: Number(length),
            start: Number(start),
            totalCount: data.count,
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

exports.userStatusChange = async (req, res) => {
    try {
        const { id, status } = dot(req.body);

        const user = await User.update({ status }, { where: { id } })

        return res.json(eot({
            status: 1,
            msg: "success"
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

exports.userNameChange = async (req, res) => {
    try {
        const { id, userName } = dot(req.body);

        const user = await User.update({ userName }, { where: { id } })

        return res.json(eot({
            status: 1,
            msg: "success"
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

exports.userDelete = async (req, res) => {
    try {
        const { id } = dot(req.body);

        const user = await User.destroy({ where: { id } })

        return res.json(eot({
            status: 1,
            msg: "success"
        }));
    } catch (error) {
        return errorHandler(res, error);
    }
};

