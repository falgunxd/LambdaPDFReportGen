import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth"
import chromium from "@sparticuz/chromium"
import { executablePath } from "puppeteer-core";
import { DEFAULT_VIEWPORT } from "puppeteer-core";


async function scrape (url) {
    try {
        puppeteerExtra.use(stealthPlugin());
        // browser config for local environment
        // const browser = await puppeteerExtra.launch({
        //     headless: "new",
        //     executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        // })

        

        // browser config for lambda environment
        const browser = await puppeteerExtra.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        })


        const page = await browser.newPage();

        await page.goto(url)

        // what to do with the url
        const h1= await page.evaluate(()=>{
            const h1 = document.querySelector("h1");
            return h1 ? h1.innerText : null;
        })

        // close the browser and its pages
        const pages = await browser.pages();
        await Promise.all(pages.map(async(page)=>page.close()));
        await browser.close();

        return h1;
    }
    catch (err) {
        console.log("error at scrape ", err)
    }
}
export const handler = async (event, contact) => {
    try {
        const body = JSON.parse(event.body);
        const {url} = body;
        const data = await scrape(url);
        console.log(data);
        
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    }
    catch (err) {
        console.log("error at lambdaAWSYT ", err)
        return {
            statusCode: 500,
            body: JSON.stringify({message: err.message,})
        }
    }
};

handler({
    body: JSON.stringify({
        url: "https://cobaltintelligence.com"
    })
})