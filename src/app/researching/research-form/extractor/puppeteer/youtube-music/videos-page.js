import { MainExtractorError } from "../main-extractor-error.js";
import { getMilliseconds } from "../utils.js";

export async function getVideos(core, routes){
  try {
    await core.page.goto(routes.videos);
		await new Promise(resolve => setTimeout(resolve, 500));
		let videos = await core.page.evaluate(async () => {
			let result = [];
			for(let video of document.querySelectorAll('ytmusic-responsive-list-item-renderer')){
				video.scrollIntoView({ behavior: 'smooth' });
				await new Promise(resolve => setTimeout(resolve, 100));
				result.push({
					id: video.querySelector('a').href.split('?')[1].split('&')[0].split('=')[1],
					name: video.querySelector('a').textContent.trim(),
					link: video.querySelector('a').href,
					image: video.querySelector('img').src,
					duration: video.querySelector('yt-formatted-string.fixed-column').textContent
				});
			}
			return result;
		});
		return videos.map(video => ({ ...video, duration: getMilliseconds(video.duration) }));
  } catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección VIDEOS');
  }
}