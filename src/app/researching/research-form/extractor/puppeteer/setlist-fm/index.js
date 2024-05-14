import puppeteer from "puppeteer";
import { MainExtractorError } from "../main-extractor-error.js";
import { closingData, getArguments, sendFinalResponse } from '../utils.js';
import { acceptCookies, initialNavigation, searchBand } from "./search-page.js";
import { getId, getRoutes, getTotalPages } from "./main-page.js";
import { getGallery } from "./gallery-page.js";
import { getAlbums } from "./discography-page.js";
import { getConcerts } from "./concerts-page.js";
import { getCountries, getTours, getVenues, getYears } from "./depurators.js";
import { getFullVenues } from "./venue-page.js";

// Main Data
const DATA = { resource: 'SetlistFmExtractor', warnList: [] };
const ARGS = getArguments(process.argv, { id: null, band: null, url: null });

async function scrapeData(){

	// Configuration
	const browser = await puppeteer.launch({ headless: !ARGS?.showBrowser, slowMo: ARGS?.time });
	const page = await browser.newPage();
	const CORE = { DATA, ARGS, page };

	try {
		// Previous Pages
		await initialNavigation(CORE);
		await acceptCookies(CORE);
		ARGS?.band && await searchBand(CORE);

		// Main Page
		const statisticsLink = await getRoutes(CORE);
		const totalPages = await getTotalPages(CORE);
		const id = await getId(CORE);
		// Gallery
		const gallery = await getGallery(CORE);
		// Albums & Songs
		const [albums, songs] = await getAlbums(CORE, statisticsLink);
		// Concerts
		const concerts = await getConcerts(CORE, totalPages, id); 
		// Tours
		const tours = getTours(CORE, concerts);
		// Years
		const years = getYears(CORE, concerts);
		// Venues
		const venues = await getFullVenues(CORE, getVenues(CORE, concerts));
		// Countries
		const countries = getCountries(CORE, venues);

		// Result
		const result = { id, tours, countries, venues, years, gallery, albums, songs, concerts };
		await browser.close();
		return JSON.stringify(result);

	// Error Handling
	} catch (error) {
		await browser.close();
		if(error instanceof MainExtractorError) throw error;
		else throw new MainExtractorError(DATA, error, 'Error en MAIN');
	}
};

/* Result */
scrapeData()
	.then((content) => sendFinalResponse(closingData(DATA, content)))
	.catch((error) => sendFinalResponse(error.getErrorResponse()));