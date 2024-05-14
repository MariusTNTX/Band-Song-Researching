import { MainExtractorError } from "../main-extractor-error.js";

export async function getRoutes(core){
  try {
		await core.page.waitForSelector('body > div.body > div.container > div.row.main > div.rightColumn.col-xs-12.col-md-9 > div.row.contentBox.searchFilter');
		return await core.page.evaluate(() => {
			return document.querySelector('a[title="View song statistics of all setlists"]')?.href || null;
		});
	} catch (error) {
		if(error instanceof MainExtractorError) throw error;
    else throw new MainExtractorError(core.DATA, error, 'Error general en la función GET ROUTES');
	}
}

export async function getTotalPages(core){
  try {
		return await core.page.evaluate(() => {
			if(document.querySelector('a[title="Go to last page"]')){
				return document.querySelector('a[title="Go to last page"]')?.textContent || null;
			} else return Array.from(document.querySelectorAll('a.pageLink'))?.pop()?.textContent || null;
		});
	} catch (error) {
		if(error instanceof MainExtractorError) throw error;
    else throw new MainExtractorError(core.DATA, error, 'Error general en la función GET TOTAL PAGES');
	}
}

export async function getId(core){
  try {
    return core?.ARGS?.url?.split('?')?.[1]?.split('&')?.[0]?.split('=')?.[1] || null;
	} catch (error) {
    if(error instanceof MainExtractorError) throw error;
    else throw new MainExtractorError(core.DATA, error, 'Error general en la función GET ID');
	}
}