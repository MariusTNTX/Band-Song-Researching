let evaluate = () => {
    let list = document.querySelector('div[data-testid="infinite-scroll-list"]');
    let sectionList = list ? [...list.children] : [];
    sectionList.shift();
    sectionList.pop();
    let songList = sectionList.filter((_, i) => i % 2 === 1);
    sectionList = sectionList.filter((_, i) => i % 2 === 0);
    let albumList = [];
    sectionList.forEach((e, i) => {
        console.log('---');
        console.log(e.querySelector('span.encore-text-title-medium').querySelector('a').textContent);
        console.log(e);
        console.log(songList[i]);
        albumList.push({
            image: e.querySelector('img').src,
            title: e.querySelector('span.encore-text-title-medium').querySelector('a').textContent,
            type: e.querySelectorAll('span.encore-text-body-small')[0].textContent,
            year: e.querySelectorAll('span.encore-text-body-small')[1].textContent,
            songs: [...songList[i].querySelectorAll('div[data-testid="tracklist-row"]')].map(s => ({
                title: s.querySelectorAll('a')[0].children[0].textContent,
                bands: getBandsFromSong(s),
                duration: s.querySelectorAll('button')[1].nextSibling.textContent,
            }))
        });
    });
    return albumList;
}

let getBandsFromSong = (s) => {
    if ([...s.querySelectorAll('a')].length > 2) {
        let bandList = [...s.querySelectorAll('a')];
        bandList.shift();
        return bandList.map(b => b.textContent);
    }
    return [s.querySelectorAll('a')[1].textContent];
}

evaluate();