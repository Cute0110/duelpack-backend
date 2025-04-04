module.exports = (sequelize, Sequelize) => {
    const Forge = sequelize.define(
        "forge",
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
                type: Sequelize.STRING,
                defaultValue: "",
            },
            multi: {
                type: Sequelize.DOUBLE(20, 5),
                defaultValue: 0,
            },
            order: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
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

    Forge.associate = (db) => {
        Forge.belongsTo(db.user, { foreignKey: "userId", as: "user" });
        Forge.belongsTo(db.item, { foreignKey: "itemId", as: "item" });
    };
    return Forge;
};
