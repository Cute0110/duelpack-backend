module.exports = (sequelize, Sequelize) => {
    const BuyPackHistory = sequelize.define(
        "buy_pack_history",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            packItemIds: {
                type: Sequelize.STRING,
                defaultValue: "",
            },
            userPrevBalance: {
                type: Sequelize.DOUBLE(20, 5),
                defaultValue: 0,
            },
            userAfterBalance: {
                type: Sequelize.DOUBLE(20, 5),
                defaultValue: 0,
            },
            status: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            timestamps: true,
        }
    );

    BuyPackHistory.associate = (db) => {
        BuyPackHistory.belongsTo(db.user, { foreignKey: "userId", as: "user" });
    };
    return BuyPackHistory;
};
