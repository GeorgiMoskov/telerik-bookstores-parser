'use strict';
module.exports = (sequelize, DataTypes) => {
  const Author = sequelize.define('Author', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {});
  Author.associate = (models) => {
    Author.belongsToMany(models.Book, {
      through: 'book_author',
      foreignKey: 'author_id',
    });
  };
  return Author;
};
