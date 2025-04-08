module.exports = (sequelize, Sequelize) => {
    const ForgeHistory = sequelize.define(
        "forge_history",
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
            itemId: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            userPrevBalance: {
                type: Sequelize.DOUBLE(20, 5),
                defaultValue: 0,
            },
            userAfterBalance: {
                type: Sequelize.DOUBLE(20, 5),
                defaultValue: 0,
            },
            betAmount: {
                type: Sequelize.DOUBLE(20, 5),
                defaultValue: 0,
            },
            multi: {
                type: Sequelize.DOUBLE(20, 5),
                defaultValue: 0,
            },
            result: {
                type: Sequelize.STRING,
                defaultValue: "",
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

    ForgeHistory.associate = (db) => {
        ForgeHistory.belongsTo(db.user, { foreignKey: "userId", as: "user" });
        ForgeHistory.belongsTo(db.item, { foreignKey: "itemId", as: "item" });
    };
    return ForgeHistory;
};
