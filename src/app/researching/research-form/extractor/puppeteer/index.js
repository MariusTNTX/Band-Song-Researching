import puppeteer from "puppeteer";

const initArgs = process.argv.slice(2);
let args = {
	url: 'https://open.spotify.com/intl-es/artist/06HL4z0CvFAxyc27GXpf02/discography/all',
	showBrowser: false,
	time: 500
};
initArgs.map((arg, i) => {
	if(i % 2 === 0){
		args[arg.replace('--','')] = '';
	} else {
		args[initArgs[i-1].replace('--','')] = arg;
	}
});

async function openWebPage() {
	const browser = await puppeteer.launch({
		headless: args.showBrowser,
		slowMo: args.time
	});
	const page = await browser.newPage();
	await page.goto(args.url);
	await page.evaluate(() => { document.querySelector('button[aria-label="Rechazar todo"]').click() });
	await new Promise(r => setTimeout(r, 3000));
	/* await page.evaluate(() => {
		document.querySelector('#contents > ytmusic-shelf-renderer > div.header.style-scope.ytmusic-shelf-renderer > h2 > yt-formatted-string > a').click();
	});
	await new Promise(r => setTimeout(r, 3000));
	const topSongs = await page.evaluate(() => {
		document.querySelector('#contents > ytmusic-shelf-renderer > div.header.style-scope.ytmusic-shelf-renderer > h2 > yt-formatted-string > a').click();
	}); */
	const result = await page.evaluate(async () => {
		let evaluation = async () => {
			let getNumber = (text) => {
				let sufix = text.includes('M') ? 1000000 : text.includes('K') ? 1000 : 1;
				resultText = text.replaceAll(/visualizaciones|suscriptores|reproducciones|\&nbsp;|\s|\.|K|M/g, '') || 0;
				return parseInt(parseFloat(resultText.replace(/,/,'.')) * sufix);
			}
			let getTop10Songs = async () => {
				document.querySelector('#contents > ytmusic-shelf-renderer > div.header.style-scope.ytmusic-shelf-renderer > h2 > yt-formatted-string > a').click();
				await new Promise(r => setTimeout(r, 3000));
				let topSongs = Array.from(document.querySelector('div#contents.style-scope.ytmusic-playlist-shelf-renderer').children).slice(0, 10).map(s => {
					let image = s.querySelector('img').src;
					let name = s.querySelectorAll('a')[0].textContent;
					let album = s.querySelectorAll('a')[2].textContent;
					let playcount = getNumber(s.querySelector('div.secondary-flex-columns').children[1].textContent);
					return { image, name, album, playcount }
				});
				Array.from(document.querySelector('div#contents.style-scope.ytmusic-playlist-shelf-renderer').children)[0].querySelectorAll('a')[1].click();
				await new Promise(r => setTimeout(r, 3000));
				return topSongs;
			}
			let getRelatedArtists = () => {
				return document.querySelectorAll('ul#items').forEach(x => {
					let url = x.querySelector('a').href;
					let image = x.querySelector('#img').src;
					let name = x.querySelector('div.details.style-scope.ytmusic-two-row-item-renderer > div > yt-formatted-string > a').textContent;
					let subscribers = getSubscribers(x.querySelector('div.details.style-scope.ytmusic-two-row-item-renderer > span > yt-formatted-string').textContent);
					return { url, image, name, subscribers };
				});
			}
			var name = document.querySelector('yt-formatted-string.title.style-scope.ytmusic-immersive-header-renderer').textContent || '';
			var biography = document.querySelector('yt-formatted-string.non-expandable.description.style-scope.ytmusic-description-shelf-renderer').textContent || '';
			var views = getNumber(document.querySelector('yt-formatted-string.subheader-text.style-scope.ytmusic-description-shelf-renderer').textContent || '');
			var subscribers = getNumber(document.querySelector('span.yt-core-attributed-string.ytmusic-subscribe-button-renderer.count-text.yt-core-attributed-string--white-space-no-wrap').textContent || '');
			let top10Songs = await getTop10Songs();
			/* let sections = document.querySelector('div#contents.style-scope.ytmusic-section-list-renderer').children;
			let relatedArtists = getRelatedArtists();
			let albums = [];
			let songs = [];
			let songVideos = [];
			let relatedPlaylists = []; */
			return { profile: { name, biography }, stats: { views, subscribers }, top10Songs };
		};
		return await evaluation();
	});
	console.log(/* JSON.stringify( */result/* ) */);
	await browser.close();
}
openWebPage();