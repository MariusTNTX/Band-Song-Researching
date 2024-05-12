import puppeteer from "puppeteer";

async function scrapeData(){
  const browser = await puppeteer.launch({ headless: false, slowMo: 1 });
	const page = await browser.newPage();
  await page.goto(`https://www.google.com`);
  await page.waitForSelector('h1');
  
  
  
  let res = await page.evaluate((x) => {
    console.log('X = ', x);
    return x;
  }, 1);
  
  await new Promise(resolve => setTimeout(resolve, 10000));
  console.log('x = ', res);

  await browser.close();
	return { ok: true };
}

scrapeData().then((data) => {
	console.log(JSON.stringify(data, null, 2));
}).catch((error) => {
	console.error('Error:', error);
});