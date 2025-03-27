module.exports = (sequelize, Sequelize) => {
    const Cart = sequelize.define(
        "cart",
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
        },
        {
            timestamps: true,
        }
    );

    Cart.associate = (db) => {
        Cart.belongsTo(db.user, { foreignKey: "userId", as: "user" });
        Cart.belongsTo(db.item, { foreignKey: "itemId", as: "item" });
    };
    
    return Cart;
};
