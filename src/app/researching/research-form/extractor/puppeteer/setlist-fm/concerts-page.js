import { MainExtractorError } from "../main-extractor-error.js";

export async function getConcerts(core, totalPages, id){
	try {
    let concerts = [];
    for(let i = 1; i <= totalPages; i++){
      await Promise.all([
        core.page.waitForNavigation(),
        core.page.goto(`https://www.setlist.fm/search?artist=${id}&page=${i}`)
      ]);
      let pageList = await core.page.evaluate(async () => {
        let result = [];
        const months = {Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12};
        for(let concert of document.querySelectorAll('div.col-xs-12.setlistPreview')){
          result.push({
            link: concert?.querySelector('a')?.href || null,
            fest: concert?.querySelector('a')?.textContent?.trim()?.split(' at ')?.[1] !== concert?.querySelector('a[href*="venue/"]')?.textContent?.trim()
              ? concert?.querySelector('a')?.textContent?.trim()?.split(' at ')?.[1]?.slice(0, -5) || null : null,
            date: {
              year: parseInt(concert?.querySelector('span.year')?.textContent?.trim() || '') || null,
              month: months[concert?.querySelector('span.month')?.textContent?.trim() || ''] || null,
              day: parseInt(concert?.querySelector('span.day')?.textContent?.trim() || '') || null,
            },
            tour: concert?.querySelector('a[href*="tour="]') ? {
              id: concert?.querySelector('a[href*="tour="]')?.href?.split('=')?.[1] || null,
              link: concert?.querySelector('a[href*="tour="]')?.href || null,
              name: concert?.querySelector('a[href*="tour="]')?.textContent?.trim() || null,
            } : null,
            venue: {
              id: concert?.querySelector('a[href*="venue/"]')?.href?.split('-')?.pop()?.split('.')?.[0] || null,
              link: concert?.querySelector('a[href*="venue/"]')?.href || null,
              name: concert?.querySelector('a[href*="venue/"]')?.textContent?.trim() || null
            },
          });
        }
        return result;
      });
      concerts.push(...pageList);
    }
    return concerts;
	} catch (error) {
    if(error instanceof MainExtractorError) throw error;
    else throw new MainExtractorError(core.DATA, error, 'Error general en la función GET CONCERTS');
	}
}