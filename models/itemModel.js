module.exports = (sequelize, Sequelize) => {
    const Item = sequelize.define(
        "item",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
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
            comment: {
                type: Sequelize.TEXT,
                defaultValue: "",
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

    return Item;
};
