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
            name: {
                type: Sequelize.STRING,
                defaultValue: "",
            },
            imageUrl: {
                type: Sequelize.STRING,
                defaultValue: "",
            },
            price: {
                type: Sequelize.DOUBLE(20, 5),
                defaultValue: 0,
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
    };
    return Forge;
};
