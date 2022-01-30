const puppeteer = require("puppeteer");

module.exports = async (courseurl) => {
  try {
    const browser = await puppeteer.launch();
    const context = browser.defaultBrowserContext();
    context.overridePermissions("https://www.udemy.com/", [
      "geolocation",
      "notifications",
    ]);

    const page = await browser.newPage();
    await page.setUserAgent("UA-TEST");
    await page.goto(courseurl, { waitUntil: "networkidle0" });
    const course = await page.evaluate(() => {
      let title = document.querySelector('meta[name="title"]').content;
      let headline = document.querySelector('meta[name="description"]').content;
      let image = document.querySelector('meta[property="og:image"]').content;
      let category = document.querySelector(
        'meta[property="udemy_com:category"]'
      ).content;
      const categories = [
        "Business",
        "Development",
        "Design",
        "Finance & Accounting",
        "Health & Fitness",
        "IT & Software",
        "Marketing",
        "Music",
        "Teaching & Academics"
      ];
      if (!categories.includes(category)) category = "Other";
      let price = "unknown";
      if (
        document.querySelector(
          'div[data-purpose="course-price-text"] span:nth-child(2)'
        )
      )
        price = document.querySelector(
          'div[data-purpose="course-price-text"] span:nth-child(2)'
        ).textContent;

      let rating = document.querySelector(
        'span[data-purpose="rating-number"]'
      ).textContent;
      let expiry = "4 days left at this price";
      if (
        document.querySelector(
          '[data-purpose="safely-set-inner-html:discount-expiration:expiration-text"]'
        )
      )
        expiry = document.querySelector(
          '[data-purpose="safely-set-inner-html:discount-expiration:expiration-text"]'
        ).textContent;
      const arr = expiry.split(" ");
      let t = Number(arr[0]);
      if (arr[1] !== "days" && arr[1] !== "day") t = 0;

      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() + t);
      const month = monthNames[dateObj.getMonth()];
      const day = String(dateObj.getDate()).padStart(2, "0");
      const year = dateObj.getFullYear();
      expiry = `Expires on ${month} ${day}, ${year}`;
      let instructor = document.querySelector(
        '[data-purpose="instructor-name-top"] > span > a > span'
      ).textContent;
      return {
        title,
        headline,
        price,
        image,
        category,
        rating,
        expiry,
        instructor,
      };
    });
    course["coupon"] = courseurl;
    await browser.close();
    return course;
  } catch (er) {
    console.log(er);
    return null;
  }
};

// const randomUseragent = require('random-useragent');
// const puppeteer = require("puppeteer");
// const USER = "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.136";
// module.exports = async (courseurl) => {

//   const userAgent = randomUseragent.getRandom();
//   const UA = userAgent || USER;
//   const browser = await puppeteer.launch({
//     headless: false,
//   });
//   const page = await browser.newPage();
//   // await page.setExtraHTTPHeaders({
//   //   "user-agent":
//   //     "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.136",
//   //   accept: "application/json, text/plain, */*",
//   //   "accept-encoding": "gzip, deflate, br",
//   //   "accept-language":
//   //     "en-IN,en;q=0.9,hi-IN;q=0.8,hi;q=0.7,en-GB;q=0.6,en-US;q=0.5,eo;q=0.4",
//   // });
//   await page.setUserAgent(UA);
//   await page.setJavaScriptEnabled(true);
//   await page.goto(courseurl, { waitUntil: "networkidle0" });
//   try {
//     const price = await page.evaluate(() => {
//       return document.querySelector(
//         '[data-purpose="course-price-text"] span:nth-child(2)'
//       ).innerText;
//     });

//     return price;
//   } catch (error) {
//     console.log(error);
//   }
// };

// const cheerio = require("cheerio");
// const axios = require("axios");
// const { attr } = require("cheerio/lib/api/attributes");

// module.exports = async (courseurl) => {
//   try {
//     const response = await axios.get(courseurl);
//     const html = response.data;
//     const $ = cheerio.load(html);

//     let title = $('meta[name="title"]').attr("content");
//     let headline = $('meta[name="description"]').attr("content");
//     let image = $('meta[property="og:image"]').attr("content");
//     let category = $('meta[property="udemy_com:category"]').attr("content");
//     let price = 385;
//     let rating = $('span[data-purpose="rating-number"]').text();
//     let coupon = courseurl;
//     const course = {
//       title,
//       headline,
//       price,
//       image,
//       category,
//       rating,
//       coupon,
//     };
//     return course;
//   } catch (err) {
//     console.log(err);
//   }
// };
