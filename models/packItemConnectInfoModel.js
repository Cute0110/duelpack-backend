module.exports = (sequelize, Sequelize) => {
    const PackItemConnectInfo = sequelize.define(
        "pack_Item_Connect_Info",
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
            itemId: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            percent: {
                type: Sequelize.DOUBLE(20, 5),
                defaultValue: 0,
            },
            rarity: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
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

    PackItemConnectInfo.associate = (db) => {
        PackItemConnectInfo.belongsTo(db.pack, { foreignKey: "packId", as: "pack" });
        PackItemConnectInfo.belongsTo(db.item, { foreignKey: "itemId", as: "item" });
    };
    
    return PackItemConnectInfo;
};
