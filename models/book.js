'use strict';
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {});
  Book.associate = (models) => {
    Book.belongsToMany(models.Category, {
      through: 'book_category',
      foreignKey: 'book_id',
      onDelete: 'CASCADE',
    });

    Book.belongsToMany(models.Author, {
      through: 'book_author',
      foreignKey: 'book_id',
      onDelete: 'CASCADE',
    });

    Book.belongsTo(models.Publisher, {
      foreignKey: {
        allowNull: false,
      },
      onDelete: 'CASCADE',
    });

    Book.belongsTo(models.Website, {
      foreignKey: {
        allowNull: false,
      },
      onDelete: 'CASCADE',
    });
  };
  return Book;
};
