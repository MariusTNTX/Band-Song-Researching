import { closingData, closingError, setWarn } from "./extractor";

export function extractSpotifyJSON(INPUT_CONTENT: any){
  
  /* Datos básicos del extractor */
  const _DATA = { 
    resource: 'SpotifyJSONExtractor', //Título del extractor
    warnList: [], //Listado de warnings
  };

  /* Modificador de propiedades de canciones */
  const songParsed = (song: any, element: string) => {
    song.artists = song?.artists?.items?.map((a: any) => ({ name: a.profile.name, uri: a.uri})) || setWarn(_DATA, `algunos artistas de ${element} no han sido encontrados`);
    song.associatedVideos = song?.associations?.associatedVideos || setWarn(_DATA, `algunos posibles videos de ${element} no han sido encontrados`, []);
    song.associatedVideos = song.associatedVideos.totalCount === 0 ? [] : song.associatedVideos;
    song.playcount = parseInt(song?.playcount || setWarn(_DATA, `algunas cifras de reproducciones de ${element} no han sido encontradas`));
    song.duration = song?.duration?.totalMilliseconds || setWarn(_DATA, `algunas cifras de duración de ${element} no han sido encontradas`);
    return song;
  }

  /* Reductor de propiedades de canciones */
  const songReduced = (song: any) => {
    delete song.associations;
    delete song.discNumber;
    delete song.relinkingInformation;
    delete song.saved;
    delete song.playability;
    delete song.contentRating;
    return song;
  }

  /* Veríficar URL de procedencia */
  try {
    if(INPUT_CONTENT.log.pages.length === 0){
      return closingError(_DATA, 'El JSON introducido no contiene la URL de la página web. Por favor, recarga la página antes de comenzar a grabar');
    } else if(!INPUT_CONTENT.log.pages[0].title.includes('https://open.spotify.com')){
      return closingError(_DATA, 'El JSON introducido no proviene de la página web oficial de Spotify');
    }
  } catch (error) {
    return closingError(_DATA, 'La estructura del JSON introducido no no se corresponde con la esperada de la página web oficial de Spotify', error);
  }


  /* -------------------------------------------------------------------------------------------- */
  /* --- INFORMACIÓN DEL ARTISTA ---------------------------------------------------------------- */
  /* -------------------------------------------------------------------------------------------- */


  /* Verificar peticiones y su contenido */
  if(!INPUT_CONTENT.log.entries.some((entry: any) => entry.request.url.includes('query?operationName=queryArtistOverview'))){
    return closingError(_DATA, 'No se ha registrado ninguna petición de tipo "queryArtistOverview". Por favor, comienze a grabar desde la página principal del artista');
  } else if(!INPUT_CONTENT.log.entries.some((entry: any) => entry.request.url.includes('query?operationName=queryArtistOverview') && entry.response.content.text)){
    return closingError(_DATA, 'La petición de tipo "queryArtistOverview" no contiene texto. Por favor, repita el proceso o espere a que el problema sea solucionado');
  }

  try {
    var artistOverview = INPUT_CONTENT.log.entries
    /* Filtrar la petición de información del artista */
    .filter((entry: any) => entry.request.url.includes('query?operationName=queryArtistOverview') && entry.response.content.text)
    /* Obtener contenido */
    .map((entry: any) => JSON.parse(entry.response.content.text).data.artistUnion)
    /* Modificar estructura final */
    .map((data: any) => {
      data.topTracks = data?.discography?.topTracks?.items?.map((s: any) => s.track) || setWarn(_DATA, 'topTracks no encontrados');
      delete data.discography;
      delete data.preRelease;
      delete data.saved;
      delete data.__typename;
      delete data.goods.events.userLocation;
      delete data.profile.pinnedItem;
      delete data.profile.verified;
      data.goods.events.concerts = data.goods.events.concerts?.items?.map((x: any) => {
        x.partnerLinks = x?.partnerLinks?.items || setWarn(_DATA, 'algunos partnerLinks de conciertos no han sido encontrados');
        x.venue.location = x?.venue?.location?.name || setWarn(_DATA, 'algunas localizaciones de conciertos no han sido encontradas');
        return x;
      }) || setWarn(_DATA, 'conciertos no encontrados');
      data.goods.merch = data?.goods?.merch?.items?.map((x: any) => ({ ...x, image: x.image.sources[0].url })) || setWarn(_DATA, 'merch no encontrado'); //Siempre sources[0]
      data.profile.biography = data?.profile?.biography?.text || setWarn(_DATA, 'biografía no encontrada');
      data.profile.externalLinks = data?.profile?.externalLinks?.items || setWarn(_DATA, 'links externos no encontrados');
      data.profile.playlists = data?.profile?.playlistsV2?.items?.map((x: any) => { 
        x = x?.data || setWarn(_DATA, 'algunos datos de playlists no han sido encontrados');
        x.image = x?.images?.items?.map((y: any) => y.sources[0])?.[0] || setWarn(_DATA, 'algunas imagenes de playlists no han sido encontradas'); //Siempre sources[0]
        x.owner = x?.ownerV2?.data?.name || setWarn(_DATA, 'algunos nombres de dueños de playlists no han sido encontrados');
        delete x.ownerV2
        delete x.images
        delete x.__typename;
        return x;
      }) || setWarn(_DATA, 'playlists no encontradas');
      delete data.profile.playlistsV2;
      data.relatedContent.appearsOn = data?.relatedContent?.appearsOn?.items?.map((x: any) => x?.releases?.items?.map((y: any) => {
        y.artists = y?.artists?.items?.map((z: any) => ({ name: z.profile.name, uri: z.uri })) || setWarn(_DATA, 'algunos artistas de playlists de aparición no han sido encontrados');
        y.image = y?.coverArt?.sources?.[0] || setWarn(_DATA, 'algunas imágenes de playlists de aparición no han sido encontradas'); //Siempre sources[0]
        delete y.coverArt;
        return y;
      })?.[0] || setWarn(_DATA, 'contenido de playlists de aparición no encontrado')) || setWarn(_DATA, 'playlists de aparición no encontradas');
      data.relatedContent.discoveredOn = data?.relatedContent?.discoveredOnV2?.items?.map((x: any) => {
        x = x.data || setWarn(_DATA, 'algunos datos de playlists de descubrimiento no han sido encontrados');
        x.image = x.images?.items?.[0]?.sources?.[0] || setWarn(_DATA, 'algunas imágenes de playlists de descubrimiento no han sido encontradas'); //Siempre sources[0]
        x.owner = x.ownerV2?.data?.name || setWarn(_DATA, 'algunos nombres de dueños de playlists de descubrimiento no han sido encontrados');
        delete x.ownerV2;
        delete x.images
        delete x.__typename;
        return x;
      }) || setWarn(_DATA, 'playlists de descubrimiento no encontradas');
      delete data.relatedContent.discoveredOnV2;
      data.relatedContent.featuring = data?.relatedContent?.featuringV2?.items?.map((x: any) => {
        x = x?.data || setWarn(_DATA, 'algunos datos de playlists compartidas no han sido encontrados');
        x.image = x?.images?.items?.[0]?.sources?.[0] || setWarn(_DATA, 'algunas imágenes de playlists compartidas no han sido encontradas'); //Siempre sources[0]
        x.owner = x?.ownerV2?.data?.name || setWarn(_DATA, 'algunos nombres de dueños de playlists compartidas no han sido encontrados');
        delete x.ownerV2;
        delete x.images
        delete x.__typename;
        return x;
      }) || setWarn(_DATA, 'playlists compartidas no encontradas');
      delete data.relatedContent.featuringV2;
      data.relatedContent.relatedArtists = data?.relatedContent?.relatedArtists?.items?.map((x: any) => {
        x.name = x?.profile?.name || setWarn(_DATA, 'algunos nombres de artistas relacionados no han sido encontrados');
        x.visuals = x?.visuals?.avatarImage?.sources || setWarn(_DATA, 'algunas imágenes de artistas relacionados no han sido encontradas'); //Nunca sources[0]
        delete x.profile;
        return x;
      }) || setWarn(_DATA, 'artistas relacionados no encontrados');
      data.relatedVideos = data?.relatedVideos?.items || setWarn(_DATA, 'videos relacionados no encontrados');
      data.stats.topCities = data?.stats?.topCities?.items || setWarn(_DATA, 'top de ciudades no encontrado');
      data.visuals.avatarImage.extractedColors = data?.visuals?.avatarImage?.extractedColors?.colorRaw?.hex || setWarn(_DATA, 'color del avatar no encontrado');
      data.visuals.gallery = data?.visuals?.gallery?.items?.map((x: any) => x.sources[0]) || setWarn(_DATA, 'galería no encontrada'); //Siempre sources[0]
      data.visuals.headerImage.extractedColors = data?.visuals?.headerImage?.extractedColors?.colorRaw?.hex || setWarn(_DATA, 'color de la cabecera no encontrado');
      return data;
    })[0];
  } catch (error) {
    return closingError(_DATA, 'No se pudo obtener la información de la banda', error);
  }
  

  /* -------------------------------------------------------------------------------------------- */
  /* --- LISTA DE ÁLBUMES ----------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------------------------- */


  /* Verificar peticiones y su contenido */
  if(!INPUT_CONTENT.log.entries.some((entry: any) => entry.request.url.includes('query?operationName=queryArtistDiscographyAll'))){
    return closingError(_DATA, 'No se ha registrado ninguna petición de tipo "queryArtistDiscographyAll". Por favor, comienze a grabar desde la página principal del artista');
  } else if(!INPUT_CONTENT.log.entries.some((entry: any) => entry.request.url.includes('query?operationName=queryArtistDiscographyAll') && entry.response.content.text)){
    return closingError(_DATA, 'La petición de tipo "queryArtistOverview" no contiene texto. Por favor, repita el proceso o espere a que el problema sea solucionado');
  }

  try {
    var discographyAlbums = INPUT_CONTENT.log.entries
    /* Filtrar la petición de la discografía del artista */
    .filter((entry: any) => entry.request.url.includes('query?operationName=queryArtistDiscographyAll') && entry.response.content.text)
    /* Obtener contenido del artista */
    .map((entry: any) => JSON.parse(entry.response.content.text))
    /* Obtener listado de álbumes  */
    .map((artist: any) => artist?.data?.artistUnion?.discography?.all?.items
      .map((album: any) => album?.releases?.items?.[0] || setWarn(_DATA, 'algunos álbumes no han sido encontrados'))
      .map((album: any) => {
        album.tracks = [];
        album.images = album?.coverArt?.sources || setWarn(_DATA, 'algunas imágenes de álbumes no han sido encontradas');
        delete album.playability;
        delete album.coverArt;
        return album;
      }) || setWarn(_DATA, 'algunos álbumes no han sido procesados correctamente')
    )?.[0]
    /* Ordenar álbumes de forma cronológica */
    .sort((a: any, b: any) => a.date.isoString.localeCompare(b.date.isoString));
  } catch (error) {
    return closingError(_DATA, 'No se pudo obtener la discografía de la banda', error);
  }
    

  /* -------------------------------------------------------------------------------------------- */
  /* --- LISTA DE CANCIONES --------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------------------------- */


  /* Verificar peticiones y su contenido */
  if(!INPUT_CONTENT.log.entries.some((entry: any) => entry.request.url.includes('query?operationName=queryAlbumTracks'))){
    return closingError(_DATA, 'No se ha registrado ninguna petición de tipo "queryAlbumTracks". Por favor, grabe toda la discografía del artista en su sección correspondiente');
  } else if(!INPUT_CONTENT.log.entries.some((entry: any) => entry.request.url.includes('query?operationName=queryAlbumTracks') && entry.response.content.text)){
    return closingError(_DATA, 'Algunas peticiones de tipo "queryAlbumTracks" no contienen texto. Por favor, repita el proceso o espere a que el problema sea solucionado');
  }

  try {
    var topTracks = INPUT_CONTENT.log.entries
    /* Filtrar las peticiones de canciones */
    .filter((entry: any) => entry.request.url.includes('query?operationName=queryAlbumTracks') && entry.response.content.text)
    /* Obtener listado de canciones por álbum interrelacionando álbumes y canciones */
    .map((entry: any) => {
      let entryUrl = entry?.request?.url || setWarn(_DATA, 'algunas URLs de álbumes no han sido encontradas');
      entry = JSON.parse(entry.response.content.text)?.data?.albumUnion?.tracks?.items?.map((song: any) => song.track) || setWarn(_DATA, 'algunos grupos canciones no han sido encontrados');
      discographyAlbums.forEach((album: any) => {
        if(entryUrl.includes(album.id)){
          /* Añadir álbumes sin canciones a las canciones de la lista de canciones */
          entry.forEach((song: any) => {
            song.album = { ...album }; //No debe hacer referencia al objeto album original
            delete song.album.tracks;
            return song;
          });
          /* Añadir canciones sin álbum a los álbumes de la lista de álbumes */
          album.tracks = JSON.parse(JSON.stringify(entry)).map((song: any) => {
            song = songParsed(song, 'canciones de la discografía');
            delete song.album;
            return songReduced(song);
          });
        }
        return album;
      });
      return entry;
    })
    /* Obtener listado de canciones */
    .reduce((res: any[], album: any) => res = [ ...res, ...album ], [])
    /* Modificar estructura de las canciones */
    .map((song: any) => songReduced(songParsed(song, 'canciones de la lista')))
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
        let sortName = group.sort((a: any, b: any) => a.name.length - b.name.length)?.[0]?.name || setWarn(_DATA, 'algunos nombres originales de canciones no han sido encontrados');
        if(group[0].album.type === 'ALBUM' || !group.some((a: any) => a.album.type === 'ALBUM')){
          mainSong = group.shift();
          mainSong.otherVersions = group;
        } else {
          mainSong = group.find((a: any) => a.album.type === 'ALBUM');
          mainSong.otherVersions = group.filter((a: any) => a.album.id !== mainSong.album.id);
        }
        mainSong.originalName = sortName;
        return mainSong;
      }
      return group[0];
    });
  } catch (error) {
    return closingError(_DATA, 'No se pudo obtener la lista de canciones de la banda', error);
  }
  

  /* -------------------------------------------------------------------------------------------- */
  /* --- TOP 10 DE CANCIONES -------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------------------------- */


  try {
    artistOverview.topTracks.forEach((topSong: any) => {
      topSong = songParsed(topSong, 'canciones top');
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
      topSong.album = album;
      delete topSong.albumOfTrack;
      return songReduced(topSong);
    });
  } catch (error) {
    return closingError(_DATA, 'No se pudo obtener el top 10 de canciones de la banda', error);
  }

  return closingData(_DATA, { ...artistOverview, albums: discographyAlbums, tracks: topTracks });
}