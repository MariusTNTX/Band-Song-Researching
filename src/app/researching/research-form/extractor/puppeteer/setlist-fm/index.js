import puppeteer from "puppeteer";
import { MainExtractorError } from "../main-extractor-error.js";
import { closingData, getArguments, sendFinalResponse } from '../utils.js';
import { acceptCookies, initialNavigation, searchBand } from "./search-page.js";
import { getCountries, getId, getRoutes, getTotalPages, getTours, getVenues, getYears } from "./main-page.js";
import { getGallery } from "./gallery-page.js";
import { getAlbums } from "./discography-page.js";
import { getConcerts } from "./concerts-page.js";

// Main Data
const DATA = { resource: 'SetlistFmExtractor', warnList: [] };
const ARGS = getArguments(process.argv, { id: null, band: null, url: null });

async function scrapeData(){

	// Configuration
	const browser = await puppeteer.launch({ headless: !ARGS.showBrowser, slowMo: ARGS.time });
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
		var albums = /* await getAlbums(CORE, statisticsLink) */null;
		// Concerts
		var concerts = await getConcerts(CORE, totalPages, id); 
		//TODO Diferenciar festivales de conciertos
		//TODO Añadir ID de país a conciertos y localizaciones
		//TODO Depurar localizaciones con las de conciertos
		//TODO Recorrer rutas de localizaciones depuradas y almacenar su info
		//TODO Recorrer localizaciones con dirección y almacenar sus coordenadas y link de google maps
		//TODO Depurar tours para añadir su fecha/concierto de inicio y de fin
		
		// Venues

		// Result
		const result = { statisticsLink, totalPages, id, tours, countries, venues, years, gallery, albums, concerts };
		await browser.close();
		return result;

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