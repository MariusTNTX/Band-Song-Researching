import puppeteer from "puppeteer";
import { MainExtractorError } from "../main-extractor-error.js";
import { closingData, getArguments, sendFinalResponse } from '../utils.js';
import { getTracksFromAlbums, setTopTracksInfo, setTrackVideos } from "./depurators.js";
import { getAlbums } from "./discography-page.js";
import { getId, getProfile, getRelatedArtists, getRelatedPlaylists, getRoutes, getStats } from "./main-page.js";
import { acceptCookies, initialNavigation, searchBand } from "./previous-page.js";
import { getTop10Tracks } from "./tracks-page.js";
import { getVideos } from "./videos-page.js";

/* Main Data */
const DATA = { resource: 'YoutubeMusicExtractor', warnList: [] };
const ARGS = getArguments(process.argv, { id: null, band: null, url: null });

async function scrapeData(){

	/* Configuration */
	const browser = await puppeteer.launch({ headless: !ARGS.showBrowser, slowMo: ARGS.time });
	const page = await browser.newPage();
	const CORE = { DATA, ARGS, page };

	try {
		/* Previous Pages */
		await initialNavigation(CORE);
		await acceptCookies(CORE);
		ARGS.band && await searchBand(CORE);

		/* Main Page */
		var routes = await getRoutes(CORE);
		var id = await getId(CORE);
		var profile = await getProfile(CORE);
		var stats = await getStats(CORE);
		var relatedPlaylists = await getRelatedPlaylists(CORE);
		var relatedArtists = await getRelatedArtists(CORE);

		/* Videos */
		var videos = await getVideos(CORE, routes);

		/* Albums & Songs */
		var albums = await getAlbums(CORE, routes);
		await setTrackVideos(CORE, albums, videos);
		var tracks = await getTracksFromAlbums(CORE, albums);

		/* Top 10 Songs */
		var top10Tracks = await getTop10Tracks(CORE, routes);
		await setTopTracksInfo(CORE, top10Tracks, tracks, videos);
		
		/* Result */
		const result = { id, profile, stats, top10Tracks, relatedPlaylists, relatedArtists, albums, tracks, videos };
		await browser.close();
		return result;

	/* Error Handling */
	} catch (error) {
		await browser.close();
		if(error instanceof MainExtractorError) throw error;
		else throw new MainExtractorError(DATA, error, 'Error en la sección MAIN');
	}
};

/* Result */
scrapeData()
	.then((content) => sendFinalResponse(closingData(DATA, content)))
	.catch((error) => sendFinalResponse(error.getErrorResponse()));