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
      let students = document.querySelector(
        'div[data-purpose="enrollment"]'
      ).textContent;
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
        "Teaching & Academics",
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
        students,
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
