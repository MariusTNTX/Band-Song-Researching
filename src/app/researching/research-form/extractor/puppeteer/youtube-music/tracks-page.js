import { MainExtractorError } from "../main-extractor-error.js";

export async function getTop10Tracks(core, routes){
  try {
    await core.page.goto(routes.tracks);
		var top10Tracks = await core.page.evaluate(() => {
			return Array.from(document.querySelector('div#contents.style-scope.ytmusic-playlist-shelf-renderer').children).slice(0, 10).map(s => {
				let id = s.querySelectorAll('a')[0].href.split('?')[1].split('&')[0].split('=')[1];
				let link = s.querySelectorAll('a')[0].href;
				let name = s.querySelectorAll('a')[0].textContent.trim();
				let album = s.querySelectorAll('a')[2].textContent.trim();
				let playcount = s.querySelector('div.secondary-flex-columns').children[1].textContent.trim();
				let duration = s.querySelector('yt-formatted-string.fixed-column').textContent.trim();
				return { id, link, name, album, playcount, duration };
			});
		});
		
		return top10Tracks;
  } catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección TOP 10 TRACKS');
  }
}