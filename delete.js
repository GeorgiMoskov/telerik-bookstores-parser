const {
    Book,
    Author,
    Publisher,
    Category,
    Website,
} = require('./models');

const clearAllTables = async () => {
    try {
        await Promise.all([
            Book.destroy({
                truncate: {
                    cascade: true,
                },
            }),
            Author.destroy({
                truncate: {
                    cascade: true,
                },
            }),
            Category.destroy({
                truncate: {
                    cascade: true,
                },
            }),
            Publisher.destroy({
                truncate: {
                    cascade: true,
                },
            }),
            Website.destroy({
                truncate: {
                    cascade: true,
                },
            }),
        ]);
    } catch (e) {
       await clearAllTables();
    }
};

module.exports = {
    clearAllTables,
};
