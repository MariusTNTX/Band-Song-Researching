import { AlbumResult } from "./album-result";
import { BandResult } from "./band-result";
import { INPUT_TYPE } from "./input-type";
import { SongResult } from "./song-result";

export const ResourceList: { id: string, label: string, value: boolean, inputType: INPUT_TYPE, songList: any[] }[] = [
    { id: "spotify",      label: "Spotify",       value: true,  inputType: INPUT_TYPE.JSON, songList: [24, 15, 32, 3, 13, 21, 17, 6, 18, 9, 5, 29, 30, 4, 28, 22, 11, 1, 33, 19]},
    { id: "setlistFM",    label: "Setlist FM",    value: true,  inputType: INPUT_TYPE.TEXT, songList: [26, 2, 5, 27, 33, 23, 12, 19, 29, 6, 15, 17, 5, 32, 1, 11, 3, 13, 33, 21]},
    { id: "lastFM",       label: "Last FM",       value: true,  inputType: INPUT_TYPE.TEXT, songList: [25, 19, 1, 32, 29, 3, 27, 15, 6, 9, 21, 11, 5, 24, 23, 26, 12, 30, 17, 33]},
    { id: "youTubeMusic", label: "YouTube Music", value: true,  inputType: INPUT_TYPE.TEXT, songList: [21, 29, 11, 6, 3, 0, 23, 32, 26, 5, 27, 20, 31, 14, 9, 10, 34, 13, 15, 17]},
    { id: "theTopTens",   label: "TheTopTens",    value: true,  inputType: INPUT_TYPE.TEXT, songList: [11, 21, 7, 5, 19, 15, 16, 6, 26, 17, 3, 13, 9, 30, 8, 33, 29, 23, 32, 1]},
    { id: "chatGPT",      label: "ChatGPT",       value: false, inputType: INPUT_TYPE.TEXT, songList: [] },
];
export const AlbumList: { id: number, year: number, title: string, type: string, genres: string[] }[] = [
    { id: 8,  year: 2004, title: "Ven", type: "Studio Release", genres: [] },
    { id: 0,  year: 2006, title: "Spirit", type: "Studio Release", genres: [ 'Folk', 'Death-Melodic', 'Celtic' ] },
    { id: 1,  year: 2008, title: "Slania", type: "Studio Release", genres: [ 'Folk', 'Death-Melodic', 'Celtic' ] },
    { id: 2,  year: 2009, title: "Evocation I: The Arcane Dominion", type: "Studio Release", genres: [ 'Acoustic', 'Folk', 'Celtic', 'Rock' ] },
    { id: 3,  year: 2010, title: "Everything Remains - As It Never Was", type: "Studio Release", genres: [ 'Folk', 'Death-Melodic', 'Celtic' ] },
    { id: 4,  year: 2012, title: "Helvetios", type: "Studio Release", genres: [ 'Folk', 'Death-Melodic', 'Celtic' ] },
    { id: 5,  year: 2014, title: "Origins", type: "Studio Release", genres: [ 'Folk', 'Death-Melodic', 'Celtic' ] },
    { id: 6,  year: 2017, title: "Evocation II: Pantheon", type: "Studio Release", genres: [ 'Acoustic', 'Folk', 'Celtic', 'Rock' ] },
    { id: 7,  year: 2019, title: "Ategnatos", type: "Studio Release", genres: [ 'Folk', 'Death-Melodic', 'Celtic' ] },
    { id: 9,  year: 2022, title: "Aidus", type: "Single", genres: [] },
    { id: 10, year: 2022, title: "Exile of the Gods", type: "Single", genres: [] },
];
export const SongList: { id: number, checked: boolean, title: string, album: number | null }[] = [
    { id: 0, checked: true, album: 4, title: "Alesia" },
    { id: 1, checked: true, album: 1, title: "Gray Sublime Archon" },
    { id: 2, checked: true, album: 5, title: "From Darkness" },
    { id: 3, checked: true, album: 4, title: "Luxtos" },
    { id: 4, checked: true, album: 2, title: "Brictom" },
    { id: 5, checked: true, album: 0, title: "Tegernakô" },
    { id: 6, checked: true, album: 6, title: "LVGVS" },
    { id: 7, checked: true, album: 4, title: "Meet the Enemy" },
    { id: 8, checked: true, album: 2, title: "The Arcane Dominion" },
    { id: 9, checked: true, album: 1, title: "Inis Mona" },
    { id: 10, checked: true, album: 7, title: "Rebirth" },
    { id: 11, checked: true, album: 1, title: "Slania's Song" },
    { id: 12, checked: true, album: 1, title: "Primordial Breath" },
    { id: 13, checked: true, album: 1, title: "Calling the Rain" },
    { id: 14, checked: true, album: 4, title: "Santonian Shores" },
    { id: 15, checked: true, album: 0, title: "Uis Elveti" },
    { id: 16, checked: true, album: 1, title: "Tarvos" },
    { id: 17, checked: true, album: 2, title: "Omnos" },
    { id: 18, checked: true, album: 7, title: "Ategnatos" },
    { id: 19, checked: true, album: 3, title: "Thousandfold" },
    { id: 20, checked: true, album: 4, title: "Neverland" },
    { id: 21, checked: true, album: 3, title: "Quoth the Raven" },
    { id: 22, checked: true, album: 5, title: "Celtos" },
    { id: 23, checked: true, album: 4, title: "A Rose for Epona" },
    { id: 24, checked: true, album: 4, title: "Hope" },
    { id: 25, checked: true, album: 4, title: "Havoc" },
    { id: 26, checked: true, album: 5, title: "The Call of the Mountains" },
    { id: 27, checked: true, album: 0, title: "Your Gaulish War" },
    { id: 28, checked: true, album: 3, title: "Isara" },
    { id: 29, checked: true, album: 5, title: "King" },
    { id: 30, checked: true, album: 6, title: "Epona" },
    { id: 31, checked: true, album: 4, title: "Home" },
    { id: 32, checked: true, album: 7, title: "Ategnatos" },
    { id: 33, checked: true, album: 4, title: "Helvetios" },
    { id: 34, checked: true, album: 5, title: "Vianna" },
];

export function getTotalScore(this: any): number {
    return this.scores.reduce((acc: number, curr: number) => acc + curr, 0);
}
export function getTopScore(this: any): number {
    let topScores = this.scores.filter((score: number) => score <= 3 && score >= 1);
    if(topScores.length > 0){
        return [1,2,3].reduce((res: number, num: number) => {
            let matches = topScores.filter((s: number) => s === num).length;
            switch(num){
                case 1: res += 4 * matches * topScores.length; break;
                case 2: res += 2 * matches * topScores.length; break;
                case 3: res += 1 * matches * topScores.length; break;
            }
            return res;
        }, 0);
    }
    return 0;
}
export function getHitSongYears(this: any): number[] {
    return this.albums.reduce((res: number[], album: AlbumResult) => {
        const topSongs = album.songs.filter((s: SongResult) => s.starScore >= 4);
        if( topSongs.length > 0) return [ ...res, ...topSongs.map((_: any) => album.year - this.initYear()) ];
        return res;
    }, []);
}
export function getInitYear(this: any): number {
    return this.albums[0].year;
}

export const ExampleBandResult: BandResult = {
    name: 'Eluveitie',
    country: 'SWT',
    initYear: getInitYear,
    hitSongYears: getHitSongYears,
    albums: [
        {
            id: 0,
            year: 2006,
            title: 'Spirit',
            genres: ['Folk', 'Death-Melodic', 'Celtic'],
            songs: [
                { id: 0, title: 'Uis Elveti', starScore: 1, scores: [5,4,0], totalScore: getTotalScore, topScore: getTopScore },
                { id: 1, title: 'Tegernakô', starScore: 1, scores: [9,4,0], totalScore: getTotalScore, topScore: getTopScore },
                { id: 2, title: 'Your Gaulish War', starScore: 0.5, scores: [0,0], totalScore: getTotalScore, topScore: getTopScore }
            ],
        },
        {
            id: 1,
            year: 2008,
            title: 'Slania',
            genres: ['Folk', 'Death-Melodic', 'Celtic'],
            songs: [
                { id: 3, title: 'Inis Mona', starScore: 6, scores: [1,1,1,3,1], totalScore: getTotalScore, topScore: getTopScore  },
                { id: 4, title: "Slania's Song", starScore: 2, scores: [6,5,0,0,0], totalScore: getTotalScore, topScore: getTopScore },
                { id: 5, title: 'Gray Sublime Archon', starScore: 0.5, scores: [9,2], totalScore: getTotalScore, topScore: getTopScore },
                { id: 6, title: 'Calling the Rain', starScore: 0.5, scores: [2,0], totalScore: getTotalScore, topScore: getTopScore },
            ],
        },
        {
            id: 2,
            year: 2009,
            title: 'Evocation I: The Arcane Dominion',
            genres: ['Acoustic', 'Folk', 'Celtic', 'Rock'],
            songs: [
                { id: 7, title: 'Omnos', starScore: 2, scores: [10,6,0,0,0], totalScore: getTotalScore, topScore: getTopScore },
            ],
        },
        {
            id: 3,
            year: 2010,
            title: 'Everything Remains - As It Never Was',
            genres: ['Folk', 'Death-Melodic', 'Celtic'],
            songs: [
                { id: 8, title: 'Thousandfold', starScore: 2, scores: [2,10,10,10,6], totalScore: getTotalScore, topScore: getTopScore },
                { id: 9, title: 'Quoth the Raven', starScore: 0.5, scores: [0,0], totalScore: getTotalScore, topScore: getTopScore },
            ],
        },
        {
            id: 4,
            year: 2012,
            title: 'Helvetios',
            genres: ['Folk', 'Death-Melodic', 'Celtic'],
            songs: [
                { id: 10, title: 'A Rose for Epona', starScore: 2, scores: [4,7,2,3,0], totalScore: getTotalScore, topScore: getTopScore },
                { id: 11, title: 'Luxtos', starScore: 2, scores: [10,0,0,0], totalScore: getTotalScore, topScore: getTopScore },
                { id: 12, title: 'Helvetios', starScore: 0.5, scores: [8,0], totalScore: getTotalScore, topScore: getTopScore },
            ],
        },
        {
            id: 5,
            year: 2014,
            title: 'Origins',
            genres: ['Folk', 'Death-Melodic', 'Celtic'],
            songs: [
                { id: 13, title: 'The Call of the Mountains', starScore: 4, scores: [1,2,0,0,0], totalScore: getTotalScore, topScore: getTopScore  },
                { id: 14, title: 'King', starScore: 2, scores: [7,8,5,0], totalScore: getTotalScore, topScore: getTopScore },
            ],
        },
        {
            id: 6,
            year: 2017,
            title: 'Evocation II: Pantheon',
            genres: ['Acoustic', 'Folk', 'Celtic', 'Rock'],
            songs: [
                { id: 15, title: 'Epona', starScore: 1, scores: [4,4,0], totalScore: getTotalScore, topScore: getTopScore },
                { id: 16, title: 'LVGVS', starScore: 0.5, scores: [8,0], totalScore: getTotalScore, topScore: getTopScore },
            ],
        },
        {
            id: 7,
            year: 2019,
            title: 'Ategnatos',
            genres: ['Folk', 'Death-Melodic', 'Celtic'],
            songs: [
                { id: 17, title: 'Ategnatos', starScore: 0.5, scores: [7,9], totalScore: getTotalScore, topScore: getTopScore },
            ],
        },
    ]
}