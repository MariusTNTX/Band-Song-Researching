import { MainExtractorError } from "../main-extractor-error.js";

export async function getAlbums(core, link){
	try {
    await core.page.goto(link.replace('setlist.fm/stats/', 'setlist.fm/stats/albums/'));
    await new Promise(resolve => setTimeout(resolve, 10000));
	} catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección GET ALBUMS & SONGS');
	}
}