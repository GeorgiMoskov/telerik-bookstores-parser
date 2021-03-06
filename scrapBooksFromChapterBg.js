const {
    JSDOM,
} = require('jsdom');
const $init = require('jquery');
const _ = require('lodash');

const getPagesCount = async (linkTemplate) => {
    const linkToScrap = linkTemplate + 1;
    const dom = await JSDOM.fromURL(linkToScrap);
    const $ = $init(dom.window);
    let pagesCount = 0;
    $('ul.pagination li')
        .each((index, el) => {
            if ($.isNumeric($(el).text())) {
                pagesCount = Number($(el).text());
            }
        });
    return pagesCount;
};

const getPagesLinks = async (linkTemplate) => {
    // const pagesCount = await getPagesCount(linkTemplate);
    const pagesCount = 10; // manually limit to 20 pages
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
    const allHeadings = $('.browse .product_item>h3>a');
    const bookLinks = Array({
        from: allHeadings.length,
    });
    allHeadings.each((index, el) => {
        bookLinks[index] = 'https://www.chapter.bg/' + $(el).attr('href');
    });
    return bookLinks;
};

const getAllBookLinksInInterval = async (startIndex,
    pagesNumberPerAsync, allPagesLinksArr) => {
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
        arrOfSomeBooksUlrs = await getAllBookLinksInInterval(endIndex,
            pagesNumberPerAsync, allPagesLinksArr);
    }
    return arrOfCurrentBooksUrls.concat(_.flatten(arrOfSomeBooksUlrs));
};

const getAllBooksLinks = async (linkTemplate, pagesNumberPerAsync) => {
    const allPagesLinksArr = await getPagesLinks(linkTemplate);

    console.log('PAGES IN TOTAL: ' + allPagesLinksArr.length);
    let allBooksLinksArr = [];

    allBooksLinksArr = await getAllBookLinksInInterval(0,
        pagesNumberPerAsync, allPagesLinksArr);

    return allBooksLinksArr;
};

const getInfoFromBookPage = async (linkToBook) => {
    try {
        const dom = await JSDOM.fromURL(linkToBook);
        const $ = $init(dom.window);
        const bookDetailsJQ = $('.details');
        const bookTitle = bookDetailsJQ.find('.title').text().trim();
        const bookAuthorsArr = bookDetailsJQ
            .find('.product-details :nth-child(2) a')
            .text()
            .trim()
            .split(', ');

        const bookPublisher = bookDetailsJQ
            .find('.product-details >.item:nth-child(3) a')
            .text()
            .trim();

        const categoriesArr = bookDetailsJQ
            .find('.product-details :nth-child(4) a')
            .map((index, el) => $(el).text().trim())
            .get();

        const bookObj = {};
        bookObj.bookTitle = bookTitle;
        bookObj.bookAuthorsArr = [...bookAuthorsArr];
        bookObj.bookPublisher = bookPublisher;
        bookObj.categoriesArr = [...categoriesArr];
        bookObj.fromWhere = 'chapter.bg';
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

const getBooksInfoInInteval = async (startIndex,
    pagesNumberPerAsync, allBooksLinksArr) => {
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
        arrOfBooksObjToBeReturned = arrOfBooksObjToBeReturned
            .concat(curArrOfBooksObj);

        if (!stop) {
            arrOfBooksObjToBeReturned = arrOfBooksObjToBeReturned
                .concat(
                    await getBooksInfoInInteval(endIndex,
                        pagesNumberPerAsync, allBooksLinksArr)
                );
        }
        return [...arrOfBooksObjToBeReturned];
    } catch (e) {
        console.log('Server restricts our request!');
        console.log(new Date());
        await wait(10);
        console.log(new Date());
        return getBooksInfoInInteval(startIndex,
            pagesNumberPerAsync, allBooksLinksArr);
    }
};

const scrapFromChapterBg = async () => {
    const linkTemplate = 'https://www.chapter.bg/книги?page=';
    const pagesNumberPerAsync = 10;
    const allBooksLinksArr = await getAllBooksLinks(linkTemplate,
        pagesNumberPerAsync);

    console.log('BOOKS IN TOTAL: ' + allBooksLinksArr.length);
    const arrOfAllBooksObjs = await getBooksInfoInInteval(0,
        pagesNumberPerAsync, allBooksLinksArr);

    return arrOfAllBooksObjs;
};
module.exports = {
    scrapFromChapterBg,
};
