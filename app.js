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
    /* let arrOfAllBooks = [];
    const arrOfBooksObjsFromChapterBg = await scrapFromChapterBg();
    arrOfAllBooks = arrOfAllBooks.concat(arrOfBooksObjsFromChapterBg);
    const arrOfBooksObjsFromElexiraBg = await scrapFromElixiraBg();
    arrOfAllBooks = arrOfAllBooks.concat(arrOfBooksObjsFromElexiraBg);
    */
     const arrOfAllBooks = _.flatten( await Promise.all(
       [
        scrapFromChapterBg(),
        scrapFromElixiraBg(),
       ]
   ));
    eneterDataToDb(arrOfAllBooks);
};
const main = async () => {
    await clearAllTables();
    await scrapBooksInfo();
};
main();
