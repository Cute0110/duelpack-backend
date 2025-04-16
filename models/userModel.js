module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define(
        "user",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userCode: {
                type: Sequelize.STRING,
                defaultValue: "",
            },
            fullName: {
                type: Sequelize.STRING,
                defaultValue: "",
            },
            userName: {
                type: Sequelize.STRING,
                defaultValue: "",
            },
            emailAddress: {
                type: Sequelize.STRING,
                defaultValue: "",
            },
            avatarURL: {
                type: Sequelize.STRING,
                defaultValue: "/images/users/default.png",
            },
            phoneNumber: {
                type: Sequelize.STRING,
                defaultValue: "",
            },
            residentialAddress: {
                type: Sequelize.STRING,
                defaultValue: "",
            },
            ipAddress: {
                type: Sequelize.STRING,
                defaultValue: "",
            },
            password: {
                type: Sequelize.STRING,
                defaultValue: "",
            },
            balance: {
                type: Sequelize.DOUBLE(20, 5),
                defaultValue: 0,
            },
            totalDeposit: {
                type: Sequelize.DOUBLE(20, 5),
                defaultValue: 0,
            },
            totalWager: {
                type: Sequelize.DOUBLE(20, 5),
                defaultValue: 0,
            },
            totalEarning: {
                type: Sequelize.DOUBLE(20, 5),
                defaultValue: 0,
            },
            unClaimEarning: {
                type: Sequelize.DOUBLE(20, 5),
                defaultValue: 0,
            },
            referralCode: {
                type: Sequelize.STRING,
                defaultValue: "",
            },
            status: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            lastFirstPackSpinTime: {
                type: Sequelize.DATE,
                allowNull: false, // or false, depending on your requirements
                defaultValue: Sequelize.NOW, // or Sequelize.NOW if you want it to default to the current time
            },
            lastSecondPackSpinTime: {
                type: Sequelize.DATE,
                allowNull: false, // or false, depending on your requirements
                defaultValue: Sequelize.NOW, // or Sequelize.NOW if you want it to default to the current time
            },
        },
        {
            timestamps: true,
        }
    );

    User.associate = (db) => {
        User.hasMany(db.affiliate, {
            foreignKey: "userId",
            as: "affiliates",
            onDelete: "CASCADE",
            hooks: true,
        });

        User.hasMany(db.affiliate, {
            foreignKey: "referId",
            as: "referrals",
            onDelete: "CASCADE",
            hooks: true,
        });
    };

    return User;
};
