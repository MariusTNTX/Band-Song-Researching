import { MainExtractorError } from "../main-extractor-error.js";
import { getMilliseconds, getNumber } from "../utils.js";

export async function scrapeAlbums(DATA, page, albumLinks){
  try {
    let albums = [];
    for (let link of albumLinks) {
      await page.goto(link);
      await page.waitForSelector(`meta[content="${link}"]`);
      let album = await page.evaluate((link) => {
        let result = {};
        result.id = link.substring(link.lastIndexOf('/') + 1);
        result.link = link;
        result.image = document.querySelector('ytmusic-cropped-square-thumbnail-renderer img').src;
        result.name = document.querySelector('h2 yt-formatted-string').textContent.trim();
        result.type = document.querySelector('div.subtitle-container span').textContent.trim();
        result.year = parseInt(document.querySelector('div.subtitle-container yt-formatted-string span:last-of-type').textContent.trim() || '0');
        result.description = document.querySelector('yt-formatted-string#description').textContent.trim() || null;
        result.tracks = [];
        document.querySelectorAll('div#contents ytmusic-responsive-list-item-renderer').forEach(track => {
          result.tracks.push({
            id: track.querySelector('div.flex-columns a').href.split('?')[1].split('&')[0].split('=')[1],
            link: track.querySelector('div.flex-columns a').href,
            trackNumber: parseInt(track.querySelector('yt-formatted-string').textContent.trim() || '0'),
            name: track.querySelector('div.flex-columns a').textContent.trim(),
            playcount: track.querySelectorAll('div.flex-columns yt-formatted-string')[2].textContent.trim(),
            duration: track.querySelector('div.fixed-columns yt-formatted-string').textContent.trim()
          });
        });
        return result;
      }, link);
      albums.push({ ...album, tracks: album.tracks.map(track => ({ ...track, playcount: getNumber(track.playcount), duration: getMilliseconds(track.duration) }))});
    }
    return albums;
  } catch (error) {
    throw new MainExtractorError(DATA, error, 'Error al extraer la información de los álbumes');
  }
}

export async function getAlbums(core, routes){
  try {
    if(routes.albums || routes.singles){
			await core.page.goto(routes.albums || routes.singles);
			await new Promise(resolve => setTimeout(resolve, 500));
			let albumLinks = await core.page.evaluate(() => {
				let links = [];
				document.querySelectorAll('ytmusic-grid-renderer a.yt-simple-endpoint.image-wrapper.style-scope.ytmusic-two-row-item-renderer').forEach(album => {
					links.push(album.href);
				});
				return links;
			});
			let albums = await scrapeAlbums(core.DATA, core.page, albumLinks);
			return albums
				.map(album => {
					album.playcount = album.tracks.reduce((res, track) => res += track.playcount, 0);
					album.playAverage = parseInt((album.playcount / album.tracks.length) + '');
					album.duration = album.tracks.reduce((res, track) => res += track.duration, 0)
					return album;
				})
				.sort((a, b) => b.playcount - a.playcount);
		} else {
      throw new MainExtractorError(core.DATA, error, 'No se han encontrado botones de Más');
		}
  } catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección GET ALBUMS');
  }
}