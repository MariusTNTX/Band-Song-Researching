import { MainExtractorError } from "../main-extractor-error.js";

export async function getFullVenues(core, venues){
	try {
    let newVenues = [];
    for(let venue of venues){
      await Promise.all([
        core.page.waitForNavigation(),
        core.page.goto(venue.link)
      ]);
      let newInfo = await core.page.evaluate(() => {
        let result = {};
        document.querySelectorAll('div.info div.form-group')?.forEach(row => {
          switch(row?.querySelector('span')?.textContent?.trim()){
            case 'Address': result.address = row?.querySelector('p')?.textContent?.trim() || null; 
              break;
            case 'Web': result.externalLinks = Array.from(row?.querySelectorAll('a'))?.map(a => ({
              link: a?.href || null,
              name: a?.textContent?.trim() || null
            })) || null;
              break;
            case 'Opened': result.active = row?.querySelectorAll('span')?.[1]?.textContent?.trim() || null;
              break;
          }
        });
        return result;
      });
      newVenues.push({ ...venue, ...newInfo });
    }
    return [ ...newVenues ];
	} catch (error) {
    if(error instanceof MainExtractorError) throw error;
    else throw new MainExtractorError(core.DATA, error, 'Error general en la función GET FULL VENUES');
	}
}