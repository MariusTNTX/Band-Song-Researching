import { MainExtractorError } from "../main-extractor-error.js";
import { getMilliseconds, getNumber, songsAreEqual } from "../utils.js";

export async function getTracksFromAlbums(core, albums){
  try {
    let tracks = [];
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
    return tracks;
  } catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección GET TRACKS FROM ALBUMS');
  }
}

export async function setTrackVideos(core, albums, videos){
  try {
    albums = albums.map(album => {
			album.tracks = album.tracks.map(track => {
        videos.map(video => {
          if(video.id === track.id && !track.videos) track.videos = [];
          if(video.id === track.id) track.videos.push(video);
        });
        return track;
      });
			return album;
		})
  } catch (error) {
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección SET TRACK VIDEOS');
  }
}

export async function setTopTracksInfo(core, top10Tracks, tracks, videos){
  try {
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
    throw new MainExtractorError(core.DATA, error, 'Error general en la sección SET TOP TRACKS INFO');
  }
}