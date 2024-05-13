import puppeteer from "puppeteer";
import { MainExtractorError } from "../main-extractor-error.js";
import { closingData, getArguments, sendFinalResponse } from '../utils.js';
import { acceptCookies, initialNavigation, searchBand } from "./search-page.js";
import { getCountries, getId, getRoutes, getTotalPages, getTours, getVenues, getYears } from "./main-page.js";
import { getGallery } from "./gallery-page.js";
import { getAlbums } from "./discography-page.js";
import { getConcerts } from "./concerts-page.js";
import { setTourIntervals, setVenueMerge } from "./depurators.js";
import { getFullVenues } from "./venue-page.js";

// Main Data
const DATA = { resource: 'SetlistFmExtractor', warnList: [] };
const ARGS = getArguments(process.argv, { id: null, band: null, url: null });

async function scrapeData(){

	// Configuration
	const browser = await puppeteer.launch({ headless: !ARGS.showBrowser, slowMo: ARGS.time, maxBuffer: 1024 * 1024 * 10 });
	const page = await browser.newPage();
	const CORE = { DATA, ARGS, page };

	try {
		// Previous Pages
		await initialNavigation(CORE);
		await acceptCookies(CORE);
		ARGS.band && await searchBand(CORE);

		// Main Page
		var statisticsLink = await getRoutes(CORE);
		var totalPages = await getTotalPages(CORE);
		var id = await getId(CORE);
		var tours = await getTours(CORE);
		var countries = await getCountries(CORE);
		var venues = await getVenues(CORE);
		var years = await getYears(CORE);
		var gallery = await getGallery(CORE);
		// Albums & Songs
		var [albums, songs] = await getAlbums(CORE, statisticsLink);
		// Concerts
		var concerts = await getConcerts(CORE, totalPages, id); 
		// Tours
		tours = setTourIntervals(CORE, tours, concerts);
		// Venues
		[venues, concerts] = setVenueMerge(CORE, venues, countries, concerts);
		venues = await getFullVenues(CORE, venues);
		//TODO No pilla bien conciertos finales de tours
		//TODO Coger listado de tours, países y localizaciones de la lista de conciertos (porque parecen ser máximo 50)

		// Result
		const result = { id, tours, countries, venues, years, gallery, albums, songs, concerts };
		await browser.close();
		return JSON.stringify(result);

	// Error Handling
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