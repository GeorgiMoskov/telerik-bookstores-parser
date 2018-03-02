const { JSDOM } = require('jsdom');
const $init = require('jquery');
const _ = require('lodash');

const getPagesCount = async (linkTemplate) =>{
    const linkToScrap = linkTemplate + 1;
    const dom = await JSDOM.fromURL(linkToScrap);
    const $ = $init(dom.window);
    let pagesCount = 0;
    $('ul.pagination li')
    .each( (index, el) => {
       if ( $.isNumeric($(el).text()) ) {
        pagesCount = Number($(el).text());
       }
    });
    return pagesCount;
};

const getPagesLinks = async (linkTemplate) => {
    /*
    USE THIS IF YOU WANT TO TAKE ALL AVALIABLE PAGES
    const pagesCount = await getPagesCount(linkTemplate);
    */
    const pagesCount = 10;
    let currentPage = -1;
    const allPagesUrls = Array.from({ length: pagesCount })
    .map((el) => {
        currentPage +=1;
        return (linkTemplate + currentPage);
    });

    return allPagesUrls;
};

const getAllBooksLinkFromPage = async (linkToScrap) => {
    const dom = await JSDOM.fromURL(linkToScrap);
    const $ = $init(dom.window);
    const allHeadings = $('.browse .product_item>h3>a');
    const bookLinks = Array({ from: allHeadings.length });
    allHeadings.each((index, el)=>{
        bookLinks[index] = 'https://www.chapter.bg/'+ $(el).attr('href');
    });
    return bookLinks;
};

const getAllBooksLinks = async (linkTemplate) => {
    const allPagesLinksArr = await getPagesLinks(linkTemplate);
    const promises = allPagesLinksArr.map(getAllBooksLinkFromPage);
    const booksUrlFromEachPageArr = await Promise.all(promises);
    const allBooksLinks = _.flatten(booksUrlFromEachPageArr);

    return allBooksLinks;
};

const getInfoFromBookPage = async (linkToBook) => {
    const dom = await JSDOM.fromURL(linkToBook);
    const $ = $init(dom.window);
    
};

const scrapBooksInfo = async (linkTemplate) => {
     const allBooksLinksArr = await getAllBooksLinks(linkTemplate);
};


const webPageTemplate = 'https://www.chapter.bg/%D0%BA%D0%BD%D0%B8%D0%B3%D0%B8-%D1%85%D1%83%D0%B4%D0%BE%D0%B6%D0%B5%D1%81%D1%82%D0%B2%D0%B5%D0%BD%D0%B0-%D0%BB%D0%B8%D1%82%D0%B5%D1%80%D0%B0%D1%82%D1%83%D1%80%D0%B0-cat-20.html?page=';

const main = async () => {
    const allBooksLinks = await getAllBooksLinks(webPageTemplate);
    console.log(allBooksLinks.join('\n'));
};
main();
