import { MainExtractorError } from "../main-extractor-error.js";

export async function initialNavigation(core){
  try {
		if(core?.ARGS?.url){
			await core.page.goto(core?.ARGS?.url);
		} else if(core?.ARGS?.id){
			await core.page.goto(`https://www.setlist.fm/search?artist=${core?.ARGS?.id}`);
		} else if(core?.ARGS?.band){
      core.ARGS.band = core?.ARGS?.band?.replaceAll(/%20| |\s|_/g,'+') || null;
			await core.page.goto(`https://www.setlist.fm/search?query=${core?.ARGS?.band}`);
		} 
	} catch (error) {
		if(error instanceof MainExtractorError) throw error;
    else throw new MainExtractorError(core.DATA, error, 'Error general en la función NAVIGATION');
	}
}

export async function acceptCookies(core){
  try {
    await core.page.waitForSelector('div[role="dialog"] button[mode="primary"]');
		await core.page.click('div[role="dialog"] button[mode="primary"]');
	} catch (error) {
		if(error instanceof MainExtractorError) throw error;
    else throw new MainExtractorError(core.DATA, error, 'Error general en la función COOKIES');
	}
}

export async function getArtist(core){
  try{
    let artists = await core.page.evaluate(() => {
      let result = [];
      document.querySelector('ul.listUnstyled.hangingIndent')?.querySelectorAll('li')?.forEach(li => {
        result.push({
          id: li?.querySelector('a')?.href?.split('?')?.[1]?.split('&')?.[0]?.split('=')?.[1] || null,
          link: li?.querySelector('a')?.href || null,
          name: li?.querySelector('a span')?.textContent?.trim() || null,
          playcount: parseInt(Array.from(li?.querySelectorAll('span'))?.[1]?.textContent?.trim() || '') || null
        });
      });
      return result;
    });
    return artists
      .filter(a => a?.name?.toLowerCase() === core?.ARGS?.band?.toLowerCase()?.replaceAll(/\+/g,' '))
      .sort((a, b) => b?.playcount - a?.playcount)?.[0];
  } catch (error) {
		if(error instanceof MainExtractorError) throw error;
    else throw new MainExtractorError(core.DATA, error, 'Error general en la función GET ARTIST');
	}
}

export async function searchBand(core){
  try {
    await core.page.waitForSelector('body > div.body > div.container > div.row.main > div.rightColumn.col-xs-12.col-md-9 > div.row.contentBox.searchFilter');
    let artist = await getArtist(core);
    core.ARGS.url = artist?.link || null;
    await core.page.goto(artist?.link);
	} catch (error) {
		if(error instanceof MainExtractorError) throw error;
    else throw new MainExtractorError(core.DATA, error, 'Error general en la función SEARCH BAND');
	}
}