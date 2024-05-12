import { MainExtractorError } from "../main-extractor-error.js";
import { getNumber } from '../utils.js';

export async function getRoutes(core){
  try {
		await core.page.waitForSelector('yt-formatted-string.title.style-scope.ytmusic-immersive-header-renderer');
		return await core.page.evaluate(() => {
			let result = {};
			document.querySelectorAll('a').forEach(a => {
				if(a.innerHTML === 'Canciones') result.tracks = a.href;
				if(a.innerHTML === 'Álbumes') result.albums = a.href;
				if(a.innerHTML === 'Sencillos') result.singles = a.href;
				if(a.innerHTML === 'Vídeos') result.videos = a.href;
			});
			return result;
		});
	} catch (error) {
		throw new MainExtractorError(core.DATA, error, 'Error general en la sección ROUTES');
	}
}

export async function getId(core){
  try {
    return core.ARGS.url.substring(core.ARGS.url.lastIndexOf('/') + 1);
	} catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección ID');
	}
}

export async function getProfile(core){
  try {
    return await core.page.evaluate(() => {
			return {
				name: document.querySelector('yt-formatted-string.title.style-scope.ytmusic-immersive-header-renderer').textContent.trim() || '',
				biography: document.querySelector('yt-formatted-string.non-expandable.description.style-scope.ytmusic-description-shelf-renderer').textContent.trim() || '',
				image: document.querySelector('img.image.style-scope.ytmusic-fullbleed-thumbnail-renderer').src || ''
			};
		});
  } catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección PROFILE');
  }
}

export async function getStats(core){
  try {
    let stats = await core.page.evaluate(() => {
			return {
				views: document.querySelector('yt-formatted-string.subheader-text.style-scope.ytmusic-description-shelf-renderer').textContent.trim() || '',
				subscribers: document.querySelector('span.yt-core-attributed-string.ytmusic-subscribe-button-renderer.count-text.yt-core-attributed-string--white-space-no-wrap').textContent.trim() || ''
			};
		});
		return { views: getNumber(stats.views), subscribers: getNumber(stats.subscribers) };
  } catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección STATS');
  }
}

export async function getRelatedPlaylists(core){
  try {
    return await core.page.evaluate(async () => {
			let result = [];
			for(let section of document.querySelectorAll('ytmusic-carousel-shelf-renderer')){
				if (section.querySelector('h2').innerHTML.includes('Destacado en')) {
					section.scrollIntoView({ behavior: 'smooth' });
					await new Promise(resolve => setTimeout(resolve, 800));
					section.querySelectorAll('ytmusic-two-row-item-renderer').forEach(playlist => {
						result.push({
							name: playlist.querySelectorAll('a')[1].textContent.trim(),
							link: playlist.querySelectorAll('a')[1].href
						});
						return playlist;
					});
				}
			}
			return result;
		});
  } catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección PLAYLISTS');
  }
}

export async function getRelatedArtists(core){
  try {
    let relatedArtists = await core.page.evaluate(async () => {
			let result = [];
			for(let section of document.querySelectorAll('ytmusic-carousel-shelf-renderer')){
				if (section.querySelector('h2').innerHTML.includes('Puede que también te guste')) {
					section.scrollIntoView({ behavior: 'smooth' });
					await new Promise(resolve => setTimeout(resolve, 800));
					section.querySelectorAll('ytmusic-two-row-item-renderer').forEach(artist => {
						result.push({
							name: artist.querySelectorAll('a')[1].textContent.trim(),
							link: artist.querySelectorAll('a')[1].href,
							subscribers: artist.querySelector('yt-formatted-string.subtitle').textContent.trim()
						});
						return artist;
					});
				}
			}
			return result;
		});
		return relatedArtists.map(artist => ({ ...artist, subscribers: getNumber(artist.subscribers) }));
  } catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección ARTISTS');
  }
}