const _ = require('lodash');
const {
    Book,
    Author,
    Publisher,
    Category,
    Website,
} = require('./models');

const eneterDataToDb = async (arrOfAllBooks) => {
    if (arrOfAllBooks.length === 0) {
        return;
    }

    const el = arrOfAllBooks.pop();

    console.log(el.bookTitle);
    console.log(el.bookAuthorsArr);
    console.log(el.bookPublisher);
    console.log(el.categoriesArr);
    console.log('--'.repeat(30));

    let authors = await Promise.all(el.bookAuthorsArr.map((author) => {
        return Author.findCreateFind({
            where: {
                name: author,
            },
        });
    }));

    let categories = await Promise.all(el.categoriesArr.map((category) => {
        return Category.findCreateFind({
            where: {
                name: category,
            },
        });
    }));

    const createdPublisher = await Publisher.findCreateFind({
        where: {
            name: el.bookPublisher,
        },
    });

    const createdWebsite = await Website.findCreateFind({
        where: {
            name: el.fromWhere,
        },
    });

    const createdBook = await Book.create({
        title: el.bookTitle,
        PublisherId: createdPublisher[0].id,
        WebsiteId: createdWebsite[0].id,
    });

    authors = _.flatten(authors);
    let authorsIds = authors.map((author) => {
        return author.id;
    });
    authorsIds = authorsIds.filter((x) => typeof x !== 'undefined');
    await createdBook.setAuthors(authorsIds);

    categories = _.flatten(categories);
    let categoriesIds = categories.map((category) => {
        return category.id;
    });
    categoriesIds = categoriesIds.filter((x) => typeof x !== 'undefined');
    await createdBook.setCategories(categoriesIds);

    await eneterDataToDb(arrOfAllBooks);
};

module.exports = {
    eneterDataToDb,
};
