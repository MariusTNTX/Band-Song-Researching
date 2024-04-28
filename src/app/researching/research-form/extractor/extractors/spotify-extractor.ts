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

    /* Obtener información del artista */
    let artistOverview = json.log.entries
      .filter((entry: any) => entry.request.url.includes('query?operationName=queryArtistOverview') && entry.response.content.text)
      .map((entry: any) => JSON.parse(entry.response.content.text))
      .map((artist: any) => artist.data.artistUnion)[0];
    
    /* Obtener listado de álbumes con sus canciones ordenados de forma cronológica */
    let discographyAlbums = json.log.entries
      .filter((entry: any) => entry.request.url.includes('query?operationName=queryArtistDiscographyAll') && entry.response.content.text)
      .map((entry: any) => JSON.parse(entry.response.content.text))
      .map((artist: any) => artist.data.artistUnion.discography.all.items
        .map((album: any) => album.releases.items[0])
        .map((album: any) => {
          album.tracks = [];
          return album;
        })
      )[0].sort((a: any, b: any) => a.date.isoString.localeCompare(b.date.isoString));
      
    /* Obtener listado de canciones ordenadas por número de escuchas */
    let topTracks = json.log.entries
      .filter((entry: any) => entry.request.url.includes('query?operationName=queryAlbumTracks') && entry.response.content.text)
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
      .reduce((res: any[], album: any) => res = [ ...res, ...album ], [])
      .sort((a: any, b: any) => parseInt(b.playcount) - parseInt(a.playcount));

    return closingData({ artistOverview, discographyAlbums, topTracks });
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