import puppeteer from "puppeteer";
import axios from "axios";
import fs from "fs";
import path from "path";


const getPageData = async (query) => {
  // get the data from bing search
  const queryString = `https://www.bing.com/images/search?q=${encodeURIComponent(query.search)}&qs=n&form=QBIR&sp=-1&pq=${encodeURIComponent(query.search)}&sc=10-2&first=1&tsc=ImageBasicHover`;
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
    'upgrade-insecure-requests': '1',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9,en;q=0.8'
  })
  await page.goto(queryString);

  // execute the fetching
  let pageData = await page.evaluate(() => {
    let list = document.getElementsByTagName('img')
    return Array.prototype.slice.call(list).filter(item => {
      return item.src.startsWith('https://') && item.src.endsWith('1.7')
    }).map(item => {
      return item.src
    })
  })
  await browser.close();
  return pageData
}


export const search = async (ctx, next) => {
  const res = ctx.request.query;
  const query = ctx.request.query;

  let definition = "";
  try {
    const apiRes = await axios.get('http://localhost:5000/dict_api/' + query.search);
    // console.log(apiRes)
    if (apiRes.data) {
      definition = apiRes.data.definition;
    }
  } catch (e) {
    // console.log(e)
  }

  // if cache exists, return it
  if (fs.existsSync(path.join(process.cwd(), "./public/cache", query.search + "0") + ".png")) {
    const resArr = [];
    let i = 0;
    while (i < 6) {
      if (fs.existsSync(path.join(process.cwd(), "./public/cache", query.search + i) + ".png")) {
        resArr.push("/public/cache/" + query.search + i + ".png")
      }
      i++;
    }
    if (resArr.length) {
      ctx.helper.success({ctx, data: {urls: resArr, definition}});
      await next()
    }
  } else {

    const pageData = await getPageData(query)
    // get the list of urls
    const imageList = pageData?.map(item => item.split("?")[0])
    // store the image to local
    for (let i = 0; i < imageList.length; i++) {
      let url = imageList[i]
      if (imageList[i].startsWith("https")) {
        axios.get(url, {responseType: "arraybuffer"}).then(({data}) => {
          fs.writeFileSync(path.join(process.cwd(), "./public/cache", query.search + i) + ".png", data, "binary")
        })
      }
    }

    if (res) {
      ctx.helper.success({ctx, data: {urls: imageList, definition}});
    } else {
      ctx.helper.error({ctx})
    }
    next()

  }
}


// for the outer service
export const get = async (ctx, next) => {
  const res = ctx.request.query;
  const query = ctx.request.query;

  const pageData = await getPageData(query)
  const imageList = pageData?.map(item => item.split("?")[0])
  for (let i = 0; i < imageList.length; i++) {
    let url = imageList[i]
    if (imageList[i].startsWith("https")) {
      axios.get(url, {responseType: "arraybuffer"}).then(({data}) => {
        fs.writeFileSync(path.join(process.cwd(), "./public/cache", query.search + i) + ".png", data, "binary")
      })
    }
  }

  if (res) {
    ctx.helper.success({ctx, data: {url: imageList[0]}});
  } else {
    ctx.helper.error({ctx})
  }
  next()
}


export const index = async (ctx, next) => {
  ctx.redirect('/public/index.html')
  await next()
}



