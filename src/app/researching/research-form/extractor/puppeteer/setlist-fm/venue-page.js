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
        document.querySelectorAll('div.info div.form-group').forEach(row => {
          switch(row.querySelector('span').textContent.trim()){
            case 'Address': result.address = row.querySelector('p').textContent.trim(); 
              break;
            case 'Web': result.externalLinks = Array.from(row.querySelectorAll('a')).map(a => ({
              link: a.href,
              name: a.textContent.trim()
            }));
              break;
            case 'Opened': result.active = row.querySelectorAll('span')[1].textContent.trim();
              break;
          }
        });
        return result;
      });
      newVenues.push({ ...venue, ...newInfo });
    }
    return [ ...newVenues ];
	} catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección GET FULL VENUES');
	}
}