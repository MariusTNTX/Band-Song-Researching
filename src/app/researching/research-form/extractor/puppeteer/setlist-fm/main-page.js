import { MainExtractorError } from "../main-extractor-error.js";

export async function getRoutes(core){
  try {
		await core.page.waitForSelector('body > div.body > div.container > div.row.main > div.rightColumn.col-xs-12.col-md-9 > div.row.contentBox.searchFilter');
		return await core.page.evaluate(() => {
			return document.querySelector('a[title="View song statistics of all setlists"]').href;
		});
	} catch (error) {
		throw new MainExtractorError(core.DATA, error, 'Error general en la sección ROUTES');
	}
}

export async function getId(core){
  try {
    return core.ARGS.url.split('?')[1].split('&')[0].split('=')[1];
	} catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección ID');
	}
}

export async function getTours(core){
	try {
    return await core.page.evaluate(() => {
			let result = [];
			document.querySelectorAll('h3').forEach(h => {
				if(h.textContent === 'Tour'){
					Array.from(h.nextElementSibling.children).forEach(li => {
						result.push({
							id: li.querySelector('a').href.split('?')[1].split('&')[2].split('=')[1],
							link: li.querySelector('a').href,
							name: li.querySelector('a span').textContent.trim(),
							plays: parseInt(Array.from(li.querySelectorAll('span'))[1].textContent.trim())
						});
					});
				}
			});
			return result;
		});
	} catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección GET TURS');
	}
}

export async function getCountries(core){
	try {
    return await core.page.evaluate(() => {
			let result = [];
			document.querySelectorAll('h3').forEach(h => {
				if(h.textContent === 'Country'){
					Array.from(h.nextElementSibling.children).forEach(li => {
						result.push({
							id: li.querySelector('a').href.split('?')[1].split('&')[1].split('=')[1],
							link: li.querySelector('a').href,
							name: li.querySelector('a span').textContent.trim(),
							plays: parseInt(Array.from(li.querySelectorAll('span'))[1].textContent.trim())
						});
					});
				}
			});
			return result;
		});
	} catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección GET COUNTRIES');
	}
}

export async function getVenues(core){
	try {
    return await core.page.evaluate(() => {
			let result = [];
			document.querySelectorAll('h3').forEach(h => {
				if(h.textContent === 'Venue'){
					Array.from(h.nextElementSibling.children).forEach(li => {
						result.push({
							id: li.querySelector('a').href.split('?')[1].split('&')[2].split('=')[1],
							link: li.querySelector('a').href,
							name: li.querySelector('a span').textContent.trim(),
							location: li.querySelector('a span').textContent.split(',')[0].trim(),
							city: li.querySelector('a span').textContent.split(',')[1].trim(),
							plays: parseInt(Array.from(li.querySelectorAll('span'))[1].textContent.trim())
						});
					});
				}
			});
			return result;
		});
	} catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección GET COUNTRIES');
	}
}

export async function getYears(core){
	try {
    return await core.page.evaluate(() => {
			let result = [];
			document.querySelectorAll('h3').forEach(h => {
				if(h.textContent === 'Year'){
					Array.from(h.nextElementSibling.children).forEach(li => {
						result.push({
							year: parseInt(li.querySelector('a span').textContent.trim()),
							link: li.querySelector('a').href,
							plays: parseInt(Array.from(li.querySelectorAll('span'))[1].textContent.trim())
						});
					});
				}
			});
			return result;
		});
	} catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección GET COUNTRIES');
	}
}