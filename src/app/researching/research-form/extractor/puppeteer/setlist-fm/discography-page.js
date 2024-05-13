import { MainExtractorError } from "../main-extractor-error.js";

export async function getAlbums(core, link) {
  try {
    await core.page.goto(link.replace('setlist.fm/stats/', 'setlist.fm/stats/albums/'));
    await core.page.waitForSelector('rect');
    return await core.page.evaluate(async () => {
      let albums = [], songs = [];
      for (let tr of Array.from(document.querySelectorAll('tbody')[1].querySelectorAll('tr'))) {
        if (tr.classList.contains('even') || tr.classList.contains('odd')) {
          tr.querySelector('a').click();
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      for (let tr of Array.from(document.querySelectorAll('tbody')[1].querySelectorAll('tr'))) {
        if (!tr.getAttribute('id')) {
          albums.push({
            name: tr.querySelector('a span').textContent.trim(),
            plays: parseInt(tr.querySelector('span.barChart span').textContent.trim())
          });
        } else {
          albums[albums.length-1].tracks = [];
          Array.from(tr.querySelectorAll('li')).forEach(li => {
            let coverArtist = Array.from(li.querySelectorAll('small')).length > 1
              ? li.querySelector('small').textContent.trim().replace('by ', '')
              : undefined;
            albums[albums.length-1].tracks.push({
              id: li.querySelector('a').href.split('=')[1],
              name: li.querySelector('a').textContent.trim(),
              link: li.querySelector('a').href,
              coverArtist,
              plays: parseInt(li.querySelector('small.songCount').textContent.replaceAll(/\(|\)|\,|\./g, '').trim())
            });
          });
          albums[albums.length-1].playAverage = albums[albums.length-1].plays / albums[albums.length-1].tracks.length;
          songs.push(...albums[albums.length-1].tracks);
        }
      }
      return [albums, songs.sort((a, b) => b.plays - a.plays)];
    });
  } catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección GET ALBUMS');
  }
}