const {
    JSDOM,
} = require('jsdom');
const $init = require('jquery');
const _ = require('lodash');

const getPagesCount = async (linkTemplate) => {
    const linkToScrap = linkTemplate + 1;
    const dom = await JSDOM.fromURL(linkToScrap);
    const $ = $init(dom.window);
    let stringThatSomeWhereHasPageCount = $('.pagination .results')
        .text()
        .trim();

    stringThatSomeWhereHasPageCount = stringThatSomeWhereHasPageCount
        .match(/\(([^()]+)\)/g)[0];

    const pagesCount = stringThatSomeWhereHasPageCount
        .match(/\d+/g)
        .map((n) => Number(n))[0];

    return pagesCount;
};

const getPagesLinks = async (linkTemplate) => {
    // const pagesCount = await getPagesCount(linkTemplate);
    const pagesCount = 2; // manually limit to 20 pages
    let currentPage = 0;
    const allPagesUrls = Array.from({
            length: pagesCount,
        })
        .map((el) => {
            currentPage += 1;
            return (linkTemplate + currentPage);
        });

    return allPagesUrls;
};

const getAllBooksLinkFromPage = async (linkToScrap) => {
    const dom = await JSDOM.fromURL(linkToScrap);
    const $ = $init(dom.window);
    const allHeadings = $('.product-list>ul>li .name>div>a');
    const bookLinks = Array({
        from: allHeadings.length,
    });
    allHeadings.each((index, el) => {
        bookLinks[index] = $(el).attr('href');
    });
    return bookLinks;
};

const getAllBookLinksInInterval = async (startIndex, pagesNumberPerAsync, allPagesLinksArr) => {
    let endIndex = startIndex + pagesNumberPerAsync;
    let stop = false;
    if (endIndex >= allPagesLinksArr.length) {
        endIndex = allPagesLinksArr.length;
        stop = true;
    }
    const promises = allPagesLinksArr
        .slice(startIndex, endIndex)
        .map(getAllBooksLinkFromPage);

    let arrOfCurrentBooksUrls = await Promise.all(promises);
    arrOfCurrentBooksUrls = _.flatten(arrOfCurrentBooksUrls);
    let arrOfSomeBooksUlrs = [];
    if (!stop) {
        arrOfSomeBooksUlrs = await getAllBookLinksInInterval(endIndex, pagesNumberPerAsync, allPagesLinksArr);
    }
    return arrOfCurrentBooksUrls.concat(_.flatten(arrOfSomeBooksUlrs));
};

const getAllBooksLinks = async (linkTemplate, pagesNumberPerAsync) => {
    const allPagesLinksArr = await getPagesLinks(linkTemplate);
    console.log('PAGES IN TOTAL: ' + allPagesLinksArr.length);
    let allBooksLinksArr = [];
    allBooksLinksArr = await getAllBookLinksInInterval(0, pagesNumberPerAsync, allPagesLinksArr);
    return allBooksLinksArr;
};

const getInfoFromBookPage = async (linkToBook) => {
    try {
        const dom = await JSDOM.fromURL(linkToBook);
        const $ = $init(dom.window);
        const bookDetailsJQ = $('.extra-wrap');
        const bookTitle = bookDetailsJQ.find('div>h1').text().trim();
        const bookAuthor = bookDetailsJQ.find('div>a.product-author-link')
            .text()
            .trim();

        const bookAuthorsArr = [];
        bookAuthorsArr.push(bookAuthor);

        const allATagsInDescriptonClass = bookDetailsJQ
            .find('.description>a');

        const bookPublisher = $(allATagsInDescriptonClass[0])
            .text()
            .trim();

        const category = $(allATagsInDescriptonClass[1])
            .text()
            .trim();

        const categoriesArr = [];
        categoriesArr.push(category);

        const bookObj = {};
        bookObj.bookTitle = bookTitle;
        bookObj.bookAuthorsArr = [...bookAuthorsArr];
        bookObj.bookPublisher = bookPublisher;
        bookObj.categoriesArr = [...categoriesArr];
        bookObj.fromWhere = 'elixira.bg';
        return bookObj;
    } catch (e) {
        throw e;
    }
};

const wait = (secs) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, secs * 1000);
    });
};

const getBooksInfoInInteval = async (startIndex, pagesNumberPerAsync, allBooksLinksArr) => {
    try {
        let endIndex = startIndex + pagesNumberPerAsync;
        let stop = false;
        if (endIndex > allBooksLinksArr.length) {
            endIndex = allBooksLinksArr.length;
            stop = true;
        }
        console.log('start: ' + startIndex);
        console.log('end: ' + endIndex);

        const promises = allBooksLinksArr
            .slice(startIndex, endIndex)
            .map(getInfoFromBookPage);

        let arrOfBooksObjToBeReturned = [];
        const curArrOfBooksObj = await Promise.all(promises);
        arrOfBooksObjToBeReturned = arrOfBooksObjToBeReturned.concat(curArrOfBooksObj);
        if (!stop) {
            arrOfBooksObjToBeReturned = arrOfBooksObjToBeReturned.concat(await getBooksInfoInInteval(endIndex, pagesNumberPerAsync, allBooksLinksArr));
        }
        return arrOfBooksObjToBeReturned;
    } catch (e) {
        console.log('Server restricts our request!');
        console.log(new Date());
        await wait(10);
        console.log(new Date());
        return getBooksInfoInInteval(startIndex, pagesNumberPerAsync, allBooksLinksArr);
    }
};

const scrapFromElixiraBg = async () => {
    const linkTemplate = 'https://www.elixiria.bg/%D1%85%D1%83%D0%B4%D0%BE%D0%B6%D0%B5%D1%81%D1%82%D0%B2%D0%B5%D0%BD%D0%B0-%D0%BB%D0%B8%D1%82%D0%B5%D1%80%D0%B0%D1%82%D1%83%D1%80%D0%B0?limit=25&page=';
    const pagesNumberPerAsync = 20;
    const allBooksLinksArr = await getAllBooksLinks(linkTemplate, pagesNumberPerAsync);
    console.log('BOOKS IN TOTAL: ' + allBooksLinksArr.length);
    const arrOfAllBooksObjs = await getBooksInfoInInteval(0, pagesNumberPerAsync, allBooksLinksArr);
    return arrOfAllBooksObjs;
};
// module.exports = {
//     scrapFromChapterBg,
// };

module.exports = {
    scrapFromElixiraBg,
};
