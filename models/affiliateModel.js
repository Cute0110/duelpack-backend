module.exports = (sequelize, Sequelize) => {
    const Affiliate = sequelize.define(
        "affiliate",
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
            referId: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            referralCode: {
                type: Sequelize.STRING,
                defaultValue: "",
            },
        },
        {
            timestamps: true,
        }
    );

    Affiliate.associate = (db) => {
        Affiliate.belongsTo(db.user, { foreignKey: "userId", as: "user" });
        Affiliate.belongsTo(db.user, { foreignKey: "referId", as: "refer" });
    };
    
    return Affiliate;
};
