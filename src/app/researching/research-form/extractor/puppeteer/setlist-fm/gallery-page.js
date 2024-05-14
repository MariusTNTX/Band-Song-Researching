import { MainExtractorError } from "../main-extractor-error.js";

export async function getGallery(core){
	try {
    if(await core.page.evaluate(() => { return document.querySelector('a.galleryLink')?.href || null })){
      await core.page.evaluate(() => document.querySelector('a.galleryLink')?.click());
      await core.page.waitForSelector('button.lity-close');
      await core.page.evaluate(async () => {
        for(let _ of Array.from(document.querySelector('div.slick-track')?.children || [])){
          await new Promise(resolve => setTimeout(resolve, 500));
          document.querySelectorAll('button')?.[2]?.click();
        }
      });
      let gallery = await core.page.evaluate(() => {
        let result = [];
        Array.from(document.querySelector('div.slick-track')?.children || []).forEach((img) => {
          if(img.querySelectorAll('div')?.[1]?.getAttribute('style')){
            result.push({
              image: img?.querySelectorAll('div')?.[1]?.getAttribute('style')
                     ?.replaceAll(/background-image:url|background-image: url|\'\)|\"\)|\(\'|\(\"/g, '') || null
            });
          }
        });
        return result;
      });
      await core.page.click('button.lity-close');
      await new Promise(resolve => setTimeout(resolve, 500));
      return gallery;
    } else return null;
	} catch (error) {
    if(error instanceof MainExtractorError) throw error;
    else throw new MainExtractorError(core.DATA, error, 'Error general en la función GET GALLERY');
	}
}