const {
    scrapFromChapterBg,
} = require('./scrapBooksFromChapterBg.js');

const {
    scrapFromElixiraBg,
} = require('./scrapBooksFromElixiraBg.js');

const {
    clearAllTables,
} = require('./delete.js');

const {
    eneterDataToDb,
} = require('./enterDataToDb.js');

const _ = require('lodash');

const scrapBooksInfo = async () => {
    const arrOfAllBooks = _.flatten(await Promise.all(
        [
            scrapFromChapterBg(),
            scrapFromElixiraBg(),
        ]
    ));
    await eneterDataToDb(arrOfAllBooks);
};
const main = async () => {
    await clearAllTables();
    await scrapBooksInfo();
};
Promise.resolve(main())
    .then(() => {
        /* eslint-disable */
        process.exit();
        /* eslint-enable */
    });
