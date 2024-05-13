import { MainExtractorError } from "../main-extractor-error.js";

export async function getGallery(core){
	try {
    if(await core.page.evaluate(() => { return document.querySelector('a.galleryLink')?.href })){
      await core.page.evaluate(() => document.querySelector('a.galleryLink').click());
      await core.page.waitForSelector('button.lity-close');
      await core.page.evaluate(async () => {
        for(let div of Array.from(document.querySelector('div.slick-track').children)){
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log(div);
          document.querySelectorAll('button')[2].click();
        }
      });
      let gallery = await core.page.evaluate(() => {
        let result = [];
        console.log('segundo evaluate');
        Array.from(document.querySelector('div.slick-track').children).forEach((img) => {
          if(img.querySelectorAll('div')?.[1]?.getAttribute('style')){
            result.push({
              image: img.querySelectorAll('div')[1].getAttribute('style')
              .replaceAll(/background-image:url|background-image: url|\'\)|\"\)|\(\'|\(\"/g, '')
            });
          }
        });
        return result;
      });
      await core.page.click('button.lity-close');
      await new Promise(resolve => setTimeout(resolve, 500));
      return gallery;
    } else return undefined;
	} catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección GET GALLERY');
	}
}