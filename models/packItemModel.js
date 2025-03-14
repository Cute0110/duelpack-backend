module.exports = (sequelize, Sequelize) => {
    const PackItem = sequelize.define(
        "pack_item",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            packId: {
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

    PackItem.associate = (db) => {
        PackItem.belongsTo(db.pack, { foreignKey: "packId", as: "pack" });
    };
    return PackItem;
};
