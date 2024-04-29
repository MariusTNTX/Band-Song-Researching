export function extractSpotifyData(INPUT_CONTENT: any, INPUT_TYPE: string){
  
  /* Constructor de resultData erróneos */
  const closingError = (message: string) => { 
    console.error('extractSpotifyDataError: ', message);
    return { ok: false, error: message, content: {} };
  };

  /* Constructor de resultData con contenido */
  const closingData = (data: any) => { 
    console.log('extractSpotifyData: ', 'La extracción de datos ha finalizado con éxito');
    return { ok: true, error: null, content: data };
  };

  /* Verificar contenido y tipo */
  if(!INPUT_CONTENT){
    return closingError('No se ha especificado el contenido del input');
  } else if(!INPUT_TYPE){
    return closingError('No se ha especificado el tipo del input');
  }

  /* ---------------------------------------------------------------------------------------------- */
  /* --- Extractor de JSON ------------------------------------------------------------------------ */
  /* ---------------------------------------------------------------------------------------------- */

  const extractSpotifyJSON = (json: any) => {

    /* Verificar tipo JSON */
    try {
      JSON.parse(JSON.stringify(INPUT_CONTENT));
    } catch (error) {
      return closingError('El contenido introducido no es de tipo JSON');
    }

    /* Veríficar URL de procedencia */
    if(!json.log.pages[0].title.includes('https://open.spotify.com')){
      return closingError('El JSON introducido no proviene de la página web oficial de Spotify');
    }

    /* INFORMACIÓN DEL ARTISTA */
    let artistOverview = json.log.entries
      /* Filtrar la petición de información del artista */
      .filter((entry: any) => entry.request.url.includes('query?operationName=queryArtistOverview') && entry.response.content.text)
      /* Obtener contenido */
      .map((entry: any) => JSON.parse(entry.response.content.text).data.artistUnion)
      /* Modificar estructura final */
      .map((data: any) => {
        data.topTracks = data.discography.topTracks.items.map((s: any) => s.track);
        delete data.discography;
        delete data.preRelease;
        delete data.saved;
        delete data.__typename;
        return data;
      })[0];
    
    /* LISTA DE ÁLBUMES */
    let discographyAlbums = json.log.entries
      /* Filtrar la petición de la discografía del artista */
      .filter((entry: any) => entry.request.url.includes('query?operationName=queryArtistDiscographyAll') && entry.response.content.text)
      /* Obtener contenido del artista */
      .map((entry: any) => JSON.parse(entry.response.content.text))
      /* Obtener listado de álbumes  */
      .map((artist: any) => artist.data.artistUnion.discography.all.items
        .map((album: any) => album.releases.items[0])
        .map((album: any) => ({ ...album, tracks: [] }))
      /* Ordenar álbumes de forma cronológica */
      )[0].sort((a: any, b: any) => a.date.isoString.localeCompare(b.date.isoString));
      
    /* LISTA DE CANCIONES */
    let topTracks = json.log.entries
      /* Filtrar las peticiones de canciones */
      .filter((entry: any) => entry.request.url.includes('query?operationName=queryAlbumTracks') && entry.response.content.text)
      /* Obtener listado de canciones por álbum interrelacionando álbumes y canciones */
      .map((entry: any) => {
        let entryUrl = entry.request.url;
        entry = JSON.parse(entry.response.content.text).data.albumUnion.tracks.items.map((song: any) => song.track);
        discographyAlbums.forEach((album: any) => {
          if(entryUrl.includes(album.id)){
            entry.forEach((song: any) => {
              song.album = { ...album, tracks: [] };
              return song;
            });
            album.tracks = [ ...album.tracks, ...entry ];
          }
          return album;
        });
        return entry;
      })
      /* Obtener listado de canciones */
      .reduce((res: any[], album: any) => res = [ ...res, ...album ], [])
      /* Ordenar por número de reproducciones */
      .sort((a: any, b: any) => parseInt(b.playcount) - parseInt(a.playcount))
      /* Agrupar duplicados en grupos */
      .reduce((res: any[], song: any, index: number) => {
        if(index > 0 && res[res.length-1].some((s: any) => s.playcount === song.playcount && 
          (song.name.toLowerCase().includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(song.name.toLowerCase())))){
          res[res.length-1].push(song);
        } else res.push([song]);
        return res;
      }, [])
      /* Reducir grupos de duplicados según antigüedad, tipo de álbum y longitud de texto de la canción */
      .map((group: any) => {
        if(group.length > 1){
          group = group.sort((a: any, b: any) => a.album.date.isoString.localeCompare(b.album.date.isoString));
          let mainSong!: any;
          if(group[0].album.type === 'ALBUM' || !group.some((a: any) => a.album.type === 'ALBUM')){
            mainSong = group.shift();
            mainSong.otherVersions = group;
          } else {
            mainSong = group.find((a: any) => a.album.type === 'ALBUM'); //TODO Encontrar la canción con el título más corto y que pertenezca a un álbum tipo ALBUM
            mainSong.otherVersions = group.filter((a: any) => a.album.id !== mainSong.album.id);
          }
          return mainSong;
        }
        return group[0];
      });
    
    /* Añadir álbum a las canciones del Top 10 */
    artistOverview.topTracks.forEach((topSong: any) => {
      let album = topTracks.reduce((res: any, song: any) => {
        if(topSong.playcount === song.playcount && 
          (song.name.toLowerCase().includes(topSong.name.toLowerCase()) || topSong.name.toLowerCase().includes(song.name.toLowerCase()))){
          res = song.album;
        } else if(song.otherVersions){
          song.otherVersions.map((s: any) => {
            if(topSong.playcount === s.playcount && 
              (s.name.toLowerCase().includes(topSong.name.toLowerCase()) || topSong.name.toLowerCase().includes(s.name.toLowerCase())))
            res = s.album;
          });
        }
        return res;
      }, {});
      delete topSong.albumOfTrack;
      topSong.album = album;
      return topSong;
    });

    return closingData({ ...artistOverview, albums: discographyAlbums, tracks: topTracks });
  };

  /* ---------------------------------------------------------------------------------------------- */
  /* --- Switch de extractores según el tipo de input --------------------------------------------- */
  /* ---------------------------------------------------------------------------------------------- */

  switch(INPUT_TYPE){
    case 'JSON': return extractSpotifyJSON(INPUT_CONTENT);
    case 'HTML': return closingError('El extractor no soporta inputs de tipo HTML');
    case 'TEXT': return closingError('El extractor no soporta inputs de tipo texto');
    default: return closingError("El tipo de input introducido no es válido. Los tipos definidos son: 'JSON', 'HTML' y 'TEXT')");
  }
}