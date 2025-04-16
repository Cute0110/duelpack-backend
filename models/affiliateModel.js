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
                allowNull: false,
                references: {
                  model: "users", // table name (not the model name)
                  key: "id",
                },
                onDelete: "CASCADE",
              },
              referId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                  model: "users",
                  key: "id",
                },
                onDelete: "CASCADE",
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
        Affiliate.belongsTo(db.user, {
            foreignKey: "userId",
            as: "user",
            onDelete: "CASCADE",
            hooks: true,
        });
    
        Affiliate.belongsTo(db.user, {
            foreignKey: "referId",
            as: "refer",
            onDelete: "CASCADE",
            hooks: true,
        });
    };
    
    return Affiliate;
};
