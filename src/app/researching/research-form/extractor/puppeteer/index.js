import puppeteer from "puppeteer";
import { writeFile } from 'fs/promises';

/* ARGUMENTS */
const initArgs = process.argv.slice(2);
let args = {
	url: 'https://open.spotify.com/intl-es/artist/06HL4z0CvFAxyc27GXpf02/discography/all',
	showBrowser: false,
	time: 1
};
initArgs.map((arg, i) => {
	if (i % 2 === 0) {
		args[arg.replace('--', '')] = '';
	} else {
		args[initArgs[i - 1].replace('--', '')] = arg;
	}
});

async function scrapeData(){

	/* CONFIGURATION */
	const browser = await puppeteer.launch({
		headless: args.showBrowser,
		slowMo: args.time
	});
	const page = await browser.newPage();
	await page.goto(args.url);

	/* FUNCTIONS */
	var getNumber = (rawText) => {
		let sufix = rawText.includes('M') ? 1000000 : rawText.includes('K') ? 1000 : 1;
		let resultText = rawText.replaceAll(/de|visualizaciones|suscriptores|reproducciones|\&nbsp;|\s|\.|K|M/g, '') || 0;
		return parseInt(parseFloat(resultText.replace(/,/, '.')) * sufix + '');
	}
	var getMilliseconds = (rawText) => {
		let num = rawText.split(':').map(time => parseInt(time));
		if (num.length === 2) num.unshift(0);
		return num[0] * 60 * 60 * 1000 + num[1] * 60 * 1000 + num[2] * 1000;
	}
	async function scrapeAlbums(albumLinks) {
		const albums = [];
		for (const link of albumLinks) {
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
				result.description = document.querySelector('yt-formatted-string#description').textContent.trim();
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
			album.tracks = album.tracks.map(track => ({ ...track, playcount: getNumber(track.playcount), duration: getMilliseconds(track.duration) }));
			albums.push(album);
		}
		return albums;
	}
	/* Copmparador de canciones */
  const songsAreEqual = (song1, song2) => {
    let extrictMatch = (song1.playcount === song2.playcount && 
      (song2.name.toLowerCase().includes(song1.name.toLowerCase()) || 
      song1.name.toLowerCase().includes(song2.name.toLowerCase())));
    if(extrictMatch) return extrictMatch;
    else {
      let [ title1, title2 ] = [ song1, song2 ].map((song) => {
        let parts = song.name.toLowerCase().replaceAll(/&/g, 'and').replaceAll(/p(rt?)?\./g, 'part').replaceAll(/[,´'`]/g, '')
                             .split(/ - |[\(\)\[\]]/).map((x) => x.trim());
        let title = [parts.shift()];
        parts.map((p) => p.startsWith('part') && title.push(p));
        return title.join(' ');
      });
      return title1 === title2;
    }
  }

	/* COOKIES */
	const rejectCookiesButton = await page.waitForSelector('button[aria-label="Rechazar todo"]');
	await rejectCookiesButton.click();
	await page.waitForSelector('yt-formatted-string.title.style-scope.ytmusic-immersive-header-renderer');

	/* ID */
	let id = args.url.substring(args.url.lastIndexOf('/') + 1);

	/* PROFILE */
	var profile = await page.evaluate(() => {
		return {
			name: document.querySelector('yt-formatted-string.title.style-scope.ytmusic-immersive-header-renderer').textContent.trim() || '',
			biography: document.querySelector('yt-formatted-string.non-expandable.description.style-scope.ytmusic-description-shelf-renderer').textContent.trim() || '',
			image: document.querySelector('img.image.style-scope.ytmusic-fullbleed-thumbnail-renderer').src || ''
		};
	});

	/* STATS */
	var stats = await page.evaluate(() => {
		return {
			views: document.querySelector('yt-formatted-string.subheader-text.style-scope.ytmusic-description-shelf-renderer').textContent.trim() || '',
			subscribers: document.querySelector('span.yt-core-attributed-string.ytmusic-subscribe-button-renderer.count-text.yt-core-attributed-string--white-space-no-wrap').textContent.trim() || ''
		};
	});
	stats = { views: getNumber(stats.views), subscribers: getNumber(stats.subscribers) };

	/* RELATED PLAYLISTS */
	var relatedPlaylists = await page.evaluate(() => {
		let result = null;
		document.querySelectorAll('ytmusic-carousel-shelf-renderer').forEach(section => {
			if (section.querySelector('h2').innerHTML.includes('Destacado en')) {
				result = [];
				section.querySelectorAll('ytmusic-two-row-item-renderer').forEach(playlist => {
					result.push({
						name: playlist.querySelectorAll('a')[1].textContent.trim(),
						link: playlist.querySelectorAll('a')[1].href
					});
					return playlist;
				});
			}
		});
		return result;
	});

	/* RELATED ARTISTS */
	var relatedArtists = await page.evaluate(() => {
		let result = null;
		document.querySelectorAll('ytmusic-carousel-shelf-renderer').forEach(section => {
			if (section.querySelector('h2').innerHTML.includes('Puede que también te guste')) {
				result = [];
				section.querySelectorAll('ytmusic-two-row-item-renderer').forEach(artist => {
					result.push({
						name: artist.querySelectorAll('a')[1].textContent.trim(),
						link: artist.querySelectorAll('a')[1].href,
						subscribers: artist.querySelector('yt-formatted-string.subtitle').textContent.trim()
					});
					return artist;
				});
			}
		});
		return result;
	});
	relatedArtists = relatedArtists.map(artist => ({ ...artist, subscribers: getNumber(artist.subscribers) }));

	/* ALBUMS & SINGLES */
	var linkIndexes = await page.evaluate(() => {
		let result = { albumIndex: null, singleIndex: null };
		document.querySelectorAll('ytmusic-carousel-shelf-renderer').forEach((section, index) => {
			if (section.querySelector('h2').innerHTML.includes('Álbumes') && section.querySelector('yt-button-renderer')) {
				result.albumIndex = index;
			} else if (section.querySelector('h2').innerHTML.includes('Sencillos') && section.querySelector('yt-button-renderer')) {
				result.singleIndex = index;
			}
		});
		return result;
	});
	if(linkIndexes.albumIndex !== null || linkIndexes.singleIndex !== null) {
		const discographyLink = linkIndexes.albumIndex !== null
			? await page.waitForSelector(`ytmusic-carousel-shelf-renderer:nth-child(${linkIndexes.albumIndex + 2}) yt-button-renderer button`)
			: await page.waitForSelector(`ytmusic-carousel-shelf-renderer:nth-child(${linkIndexes.singleIndex + 2}) yt-button-renderer button`);
		await discographyLink.click();
		await page.waitForSelector('yt-formatted-string[title="Predeterminado"]');
		const selectedChip = await page.waitForSelector('ytmusic-chip-cloud-chip-renderer[is-selected] a');
		await selectedChip.click();
		await new Promise(resolve => setTimeout(resolve, 500));
		var albumLinks = await page.evaluate(() => {
			let links = [];
			document.querySelectorAll('ytmusic-grid-renderer a.yt-simple-endpoint.image-wrapper.style-scope.ytmusic-two-row-item-renderer').forEach(album => {
				links.push(album.href);
			});
			return links;
		});
		var albums = await scrapeAlbums(albumLinks);
		albums = albums
			.map(album => {
				album.playcount = album.tracks.reduce((res, track) => res += track.playcount, 0);
				album.playAverage = parseInt((album.playcount / album.tracks.length) + '');
				album.duration = album.tracks.reduce((res, track) => res += track.duration, 0)
				return album;
			})
			.sort((a, b) => b.playcount - a.playcount);
		await page.goto(args.url);
		await page.waitForSelector('yt-formatted-string.title.style-scope.ytmusic-immersive-header-renderer');
	} else {
		console.log('No se han encontrado botones de Más');
	}
	
	/* TRACKS */
	var tracks = [];
	albums.map(album => tracks.push(...album.tracks.map(track => ({ ...track, album: { ...album, tracks: [] }}))));
	tracks = tracks
	.sort((a, b) => b.playcount - a.playcount)
	.reduce((res, song) => {
		let resIndex = res.reduce((r, group, index) => {
			if(group.some((s) => songsAreEqual(song, s))){
				return index;
			} else return r;
		}, null);
		(resIndex !== null) ? res[resIndex].push(song) : res.push([song]);
		return res;
	}, [])
	.map((group) => {
		if(group.length > 1){
			let mainSong;
			let sortName = group.sort((a, b) => a.name.length - b.name.length)?.[0]?.name;
			group = group.sort((a, b) => {
				if(b.playcount === a.playcount) return a.album.year - b.album.year;
				else return b.playcount - a.playcount;
			});
			if(group[0].album.type === 'Álbum' || !group.some((a) => a.album.type === 'Álbum')){
				mainSong = group.shift();
				mainSong.otherVersions = group;
			} else {
				mainSong = group.find((a) => a.album.type === 'Álbum');
				mainSong.otherVersions = group.filter((a) => a.album.id !== mainSong.album.id);
			}
			mainSong.sortName = sortName;
			return mainSong;
		}
		return group[0];
	});

	/* TOP 10 SONGS */
	const songsLink = await page.waitForSelector('#contents > ytmusic-shelf-renderer > div.header.style-scope.ytmusic-shelf-renderer > h2 > yt-formatted-string > a');
	await songsLink.click();
	await page.waitForSelector('div#contents.style-scope.ytmusic-playlist-shelf-renderer');
	var top10Tracks = await page.evaluate(() => {
		return Array.from(document.querySelector('div#contents.style-scope.ytmusic-playlist-shelf-renderer').children).slice(0, 10).map(s => {
			let id = s.querySelectorAll('a')[0].href.substring(s.querySelectorAll('a')[0].href.lastIndexOf('=') + 1);
			let link = s.querySelectorAll('a')[0].href;
			let name = s.querySelectorAll('a')[0].textContent.trim();
			let album = s.querySelectorAll('a')[2].textContent.trim();
			let playcount = s.querySelector('div.secondary-flex-columns').children[1].textContent.trim();
			let duration = s.querySelector('yt-formatted-string.fixed-column').textContent.trim();
			return { id, link, name, album, playcount, duration };
		});
	});
	top10Tracks = top10Tracks.map(topSong => {
		topSong.album = tracks.reduce((finalAlbum, song) => {
			if(songsAreEqual(topSong, song)){
				finalAlbum = song.album;
			} else if(song.otherVersions){
				song.otherVersions.map((s) => {
					if(songsAreEqual(topSong, song)){
						finalAlbum = s.album;
					}
				});
			}
			return finalAlbum;
		}, {});
		return { ...topSong, playcount: getNumber(topSong.playcount), duration: getMilliseconds(topSong.duration) };
	});
	await page.goto(args.url);
	await page.waitForSelector('yt-formatted-string.title.style-scope.ytmusic-immersive-header-renderer');

	/* RESULT */
	const result = { id, profile, stats, top10Tracks, relatedPlaylists, relatedArtists, albums, tracks };
	/* try {
		await writeFile(`./JSONs/${profile.name}.json`, JSON.stringify(result), null, 2);
	} catch (error) {
		console.error('Error al escribir el archivo:', error);
	} */
	await browser.close();
	return result;
};

scrapeData().then((data) => {
	console.log(JSON.stringify(data, null, 2));
}).catch((error) => {
	console.error('Error:', error);
});