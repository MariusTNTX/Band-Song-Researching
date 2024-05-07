import puppeteer from "puppeteer";

/* ------------------------------------------------------------------------------------------------ */
/* ARGUMENTS -------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------ */
try {
	let initArgs = process.argv.slice(2);
	var args = { id: null, band: null, url: null, showBrowser: true, time: 1 };
	initArgs.map((arg, i) => {
		if (i % 2 === 0) args[arg.replace('--', '')] = '';
		else args[initArgs[i - 1].replace('--', '')] = arg;
	});
} catch (error) {
	throw new Error('Error general en la sección ARGUMENTS: ' + error);
}

async function scrapeData(){

	/* ---------------------------------------------------------------------------------------------- */
	/* FUNCTIONS ------------------------------------------------------------------------------------ */
	/* ---------------------------------------------------------------------------------------------- */
	try {
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
		var scrapeAlbums = async (albumLinks) => {
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
				album.tracks = album.tracks.map(track => {
					videos.map(video => {
						if(video.id === track.id && !track.videos) track.videos = [];
						if(video.id === track.id) track.videos.push(video);
					});
					return { ...track, playcount: getNumber(track.playcount), duration: getMilliseconds(track.duration) };
				});
				albums.push(album);
			}
			return albums;
		}
		/* Comparador de canciones */
		var songsAreEqual = (song1, song2) => {
			let extrictMatch = song1.id === song2.id || (song1.playcount === song2.playcount && 
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
	} catch (error) {
		throw new Error('Error general en la sección FUNCTIONS: ' + error);
	}
	
	/* ---------------------------------------------------------------------------------------------- */
	/* CONFIGURATION & NAVIGATION ------------------------------------------------------------------- */
	/* ---------------------------------------------------------------------------------------------- */
	const browser = await puppeteer.launch({ headless: !args.showBrowser, slowMo: args.time });
	const page = await browser.newPage();
	try {
		if(args.url){
			await page.goto(args.url);
		} else if(args.id){
			await page.goto(`https://music.youtube.com/channel/${args.id}`);
		} else if(args.band){
			await page.goto(`https://music.youtube.com/search?q=${args.band.replaceAll(/%20|_/g,'+')}`);
		} 
	} catch (error) {
		throw new Error('Error general en la sección CONFIGURATION & NAVIGATION: ' + error);
	}
	
	/* ---------------------------------------------------------------------------------------------- */
	/* COOKIES -------------------------------------------------------------------------------------- */
	/* ---------------------------------------------------------------------------------------------- */
	try {
		await page.click('button[aria-label="Rechazar todo"]');
	} catch (error) {
		throw new Error('Error general en la sección COOKIES: ' + error);
	}
	
	/* ---------------------------------------------------------------------------------------------- */
	/* BAND SEARCHING (OPTIONAL) -------------------------------------------------------------------- */
	/* ---------------------------------------------------------------------------------------------- */
	try {
		if(args.band){
			await page.waitForSelector('yt-formatted-string.style-scope.ytmusic-card-shelf-header-basic-renderer');
			await page.click('a[title="Mostrar resultados de artistas"]');
			await page.waitForSelector('a[aria-pressed="true"][title="Has seleccionado la opción Mostrar resultados de artistas"]');
			const firstBandLink = await page.evaluate(() => {
				return document.querySelector('a.yt-simple-endpoint.style-scope.ytmusic-responsive-list-item-renderer').href;
			});
			args.url = firstBandLink;
			await page.goto(firstBandLink);
		}
	} catch (error) {
		throw new Error('Error general en la sección BAND SEARCHING: ' + error);
	}
	
	/* ---------------------------------------------------------------------------------------------- */
	/* ROUTES --------------------------------------------------------------------------------------- */
	/* ---------------------------------------------------------------------------------------------- */
	try {
		await page.waitForSelector('yt-formatted-string.title.style-scope.ytmusic-immersive-header-renderer');
		var routes = await page.evaluate(() => {
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
		throw new Error('Error general en la sección ROUTES: ' + error);
	}
	
	/* ---------------------------------------------------------------------------------------------- */
	/* ID ------------------------------------------------------------------------------------------- */
	/* ---------------------------------------------------------------------------------------------- */
	try {
		var id = args.url.substring(args.url.lastIndexOf('/') + 1);
	} catch (error) {
		throw new Error('Error general en la sección ID: ' + error);
	}

	/* ---------------------------------------------------------------------------------------------- */
	/* PROFILE -------------------------------------------------------------------------------------- */
	/* ---------------------------------------------------------------------------------------------- */
	try {
		var profile = await page.evaluate(() => {
			return {
				name: document.querySelector('yt-formatted-string.title.style-scope.ytmusic-immersive-header-renderer').textContent.trim() || '',
				biography: document.querySelector('yt-formatted-string.non-expandable.description.style-scope.ytmusic-description-shelf-renderer').textContent.trim() || '',
				image: document.querySelector('img.image.style-scope.ytmusic-fullbleed-thumbnail-renderer').src || ''
			};
		});
	} catch (error) {
		throw new Error('Error general en la sección PROFILE: ' + error);
	}
	
	/* ---------------------------------------------------------------------------------------------- */
	/* STATS ---------------------------------------------------------------------------------------- */
	/* ---------------------------------------------------------------------------------------------- */
	try {
		var stats = await page.evaluate(() => {
			return {
				views: document.querySelector('yt-formatted-string.subheader-text.style-scope.ytmusic-description-shelf-renderer').textContent.trim() || '',
				subscribers: document.querySelector('span.yt-core-attributed-string.ytmusic-subscribe-button-renderer.count-text.yt-core-attributed-string--white-space-no-wrap').textContent.trim() || ''
			};
		});
		stats = { views: getNumber(stats.views), subscribers: getNumber(stats.subscribers) };
	} catch (error) {
		throw new Error('Error general en la sección STATS: ' + error);
	}
	
	/* ---------------------------------------------------------------------------------------------- */
	/* RELATED PLAYLISTS ---------------------------------------------------------------------------- */
	/* ---------------------------------------------------------------------------------------------- */
	try {
		var relatedPlaylists = await page.evaluate(async () => {
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
		throw new Error('Error general en la sección RELATED PLAYLISTS: ' + error);
	}
	
	/* ---------------------------------------------------------------------------------------------- */
	/* RELATED ARTISTS ------------------------------------------------------------------------------ */
	/* ---------------------------------------------------------------------------------------------- */
	try {
		var relatedArtists = await page.evaluate(async () => {
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
		relatedArtists = relatedArtists.map(artist => ({ ...artist, subscribers: getNumber(artist.subscribers) }));
	} catch (error) {
		throw new Error('Error general en la sección RELATED ARTISTS: ' + error);
	}
	
	/* ---------------------------------------------------------------------------------------------- */
	/* VIDEOS --------------------------------------------------------------------------------------- */
	/* ---------------------------------------------------------------------------------------------- */
	try {
		await page.goto(routes.videos);
		await new Promise(resolve => setTimeout(resolve, 500));
		var videos = await page.evaluate(async () => {
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
		videos = videos.map(video => ({ ...video, duration: getMilliseconds(video.duration) }));
	} catch (error) {
		throw new Error('Error general en la sección VIDEOS: ' + error);
	}
	
	/* ---------------------------------------------------------------------------------------------- */
	/* ALBUMS & SINGLES ----------------------------------------------------------------------------- */
	/* ---------------------------------------------------------------------------------------------- */
	try {
		if(routes.albums || routes.singles){
			await page.goto(routes.albums || routes.singles);
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
		} else {
			console.error('No se han encontrado botones de Más');
		}
	} catch (error) {
		throw new Error('Error general en la sección ALBUMS & SINGLES: ' + error);
	}
	
	/* ---------------------------------------------------------------------------------------------- */
	/* TRACKS --------------------------------------------------------------------------------------- */
	/* ---------------------------------------------------------------------------------------------- */
	try {
		var tracks = [];
		albums.map(album => tracks.push(...album.tracks.map(track => {
			let alb = { ...album };
			delete alb.tracks;
			return { ...track, album: alb};
		})));
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
	} catch (error) {
		throw new Error('Error general en la sección TRACKS: ' + error);
	}
	
	/* ---------------------------------------------------------------------------------------------- */
	/* TOP 10 TRACKS -------------------------------------------------------------------------------- */
	/* ---------------------------------------------------------------------------------------------- */
	try {
		await page.goto(routes.tracks);
		var top10Tracks = await page.evaluate(() => {
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
			videos.map(video => {
				if(video.id === topSong.id && !topSong.videos) topSong.videos = [];
				if(video.id === topSong.id) topSong.videos.push(video);
			});
			return { ...topSong, playcount: getNumber(topSong.playcount), duration: getMilliseconds(topSong.duration) };
		});
	} catch (error) {
		throw new Error('Error general en la sección TOP 10 TRACKS: ' + error);
	}
	
	/* ---------------------------------------------------------------------------------------------- */
	/* RESULT --------------------------------------------------------------------------------------- */
	/* ---------------------------------------------------------------------------------------------- */
	try {
		const result = { id, profile, stats, top10Tracks, relatedPlaylists, relatedArtists, albums, tracks, videos };
		await browser.close();
		return result;
	} catch (error) {
		throw new Error('Error general en la sección RESULT: ' + error);
	}
};

/* ------------------------------------------------------------------------------------------------ */
/* RESPONSE --------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------ */
scrapeData().then((data) => {
	console.log(JSON.stringify(data, null, 2));
}).catch((error) => {
	console.error('Error:', error);
});