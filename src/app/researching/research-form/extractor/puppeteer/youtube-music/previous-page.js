import { MainExtractorError } from "../main-extractor-error.js";

export async function initialNavigation(core){
  try {
		if(core.ARGS.url){
			await core.page.goto(core.ARGS.url);
		} else if(core.ARGS.id){
			await core.page.goto(`https://music.youtube.com/channel/${core.ARGS.id}`);
		} else if(core.ARGS.band){
			await core.page.goto(`https://music.youtube.com/search?q=${core.ARGS.band.replaceAll(/%20|_/g,'+')}`);
		} 
	} catch (error) {
		throw new MainExtractorError(core.DATA, error, 'Error general en la sección CONFIGURATION & NAVIGATION');
	}
}

export async function acceptCookies(core){
  try {
		await core.page.click('button[aria-label="Rechazar todo"]');
	} catch (error) {
		throw new MainExtractorError(core.DATA, error, 'Error general en la sección COOKIES');
	}
}

export async function searchBand(core){
  try {
    await core.page.waitForSelector('yt-formatted-string.style-scope.ytmusic-card-shelf-header-basic-renderer');
    await core.page.click('a[title="Mostrar resultados de artistas"]');
    await core.page.waitForSelector('a[aria-pressed="true"][title="Has seleccionado la opción Mostrar resultados de artistas"]');
    const firstBandLink = await core.page.evaluate(() => {
      return document.querySelector('a.yt-simple-endpoint.style-scope.ytmusic-responsive-list-item-renderer').href;
    });
    core.ARGS.url = firstBandLink;
    await core.page.goto(firstBandLink);
	} catch (error) {
		throw new MainExtractorError(core.DATA, error, 'Error general en la sección BAND SEARCHING');
	}
}