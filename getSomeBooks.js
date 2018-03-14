const {
    Book,
    Author,
    Publisher,
    Category,
    Website,
} = require('./models');

const main = async () => {
    const someBooks = await Book.findAll({
        include: [{
                model: Category,
                where: {
                    // name: 'Трилъри',
                    name: {
                        $like: '%Трилъри%',
                    },
                },
            }, {
                model: Author,
            },
            {
                model: Publisher,
            },
            {
                model: Website,
            },
        ],
    });

    someBooks.forEach(async (b) => {
        console.log('Title: '+ b.title);
        console.log('Publisher: '+ b.Publisher.name);
        console.log('Authors: ');
        b.Authors.forEach((author) => {
            console.log(author.name);
        });
        console.log('Categories: ');
        b.Categories.forEach((category) => {
            console.log(category.name);
        });

        console.log('---------------');
    });
};
main();
