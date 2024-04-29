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

    /* -------------------------------------------------------------------------------------------- */
    /* --- INFORMACIÓN DEL ARTISTA ---------------------------------------------------------------- */
    /* -------------------------------------------------------------------------------------------- */

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
        delete data.goods.events.userLocation;
        delete data.profile.pinnedItem;
        delete data.profile.verified;
        data.goods.events.concerts = data.goods.events.concerts.items.map((x: any) => {
          return { ...x, partnerLinks: x.partnerLinks.items, venue: { ...x.venue, location: x.venue.location.name } };
        });
        data.goods.merch = data.goods.merch.items.map((x: any) => ({ ...x, image: x.image.sources[0].url })); //Siempre sources[0]
        data.profile.biography = data.profile.biography.text;
        data.profile.externalLinks = data.profile.externalLinks.items;
        data.profile.playlists = data.profile.playlistsV2.items.map((x: any) => { 
          x = { ...x.data, image: x.data.images.items.map((y: any) => y.sources[0])[0], owner: x.data.ownerV2.data.name }; //Siempre sources[0]
          delete x.ownerV2
          delete x.images
          delete x.__typename;
          return x;
        });
        delete data.profile.playlistsV2;
        data.relatedContent.appearsOn = data.relatedContent.appearsOn.items.map((x: any) => x.releases.items.map((y: any) => {
          let artists = y.artists.items.map((z: any) => ({ name: z.profile.name, uri: z.uri }));
          return { ...y, artists, coverArt: y.coverArt.sources[0] }; //Siempre sources[0]
        })[0]);
        data.relatedContent.discoveredOn = data.relatedContent.discoveredOnV2.items.map((x: any) => {
          x = { ...x.data, image: x.data.images.items[0].sources[0], owner: x.data.ownerV2.data.name }; //Siempre sources[0]
          delete x.ownerV2;
          delete x.images
          delete x.__typename;
          return x;
        });
        delete data.relatedContent.discoveredOnV2;
        data.relatedContent.featuring = data.relatedContent.featuringV2.items.map((x: any) => {
          x = { ...x.data, image: x.data.images.items[0].sources[0], owner: x.data.ownerV2.data.name }; //Siempre sources[0]
          delete x.ownerV2;
          delete x.images
          delete x.__typename;
          return x;
        });
        delete data.relatedContent.featuringV2;
        data.relatedContent.relatedArtists = data.relatedContent.relatedArtists.items.map((x: any) => {
          x = { ...x, name: x.profile.name, visuals: x.visuals.avatarImage.sources }; //Nunca sources[0]
          delete x.profile;
          return x;
        });
        data.relatedVideos = data.relatedVideos.items;
        data.stats.topCities = data.stats.topCities.items;
        data.visuals.avatarImage.extractedColors = data.visuals.avatarImage.extractedColors.colorRaw.hex;
        data.visuals.gallery = data.visuals.gallery.items.map((x: any) => x.sources[0]); //Siempre sources[0]
        data.visuals.headerImage.extractedColors = data.visuals.headerImage.extractedColors.colorRaw.hex;
        return data;
      })[0];
    
    /* -------------------------------------------------------------------------------------------- */
    /* --- LISTA DE ÁLBUMES ----------------------------------------------------------------------- */
    /* -------------------------------------------------------------------------------------------- */

    let discographyAlbums = json.log.entries
      /* Filtrar la petición de la discografía del artista */
      .filter((entry: any) => entry.request.url.includes('query?operationName=queryArtistDiscographyAll') && entry.response.content.text)
      /* Obtener contenido del artista */
      .map((entry: any) => JSON.parse(entry.response.content.text))
      /* Obtener listado de álbumes  */
      .map((artist: any) => artist.data.artistUnion.discography.all.items
        .map((album: any) => album.releases.items[0])
        .map((album: any) => {
          album = { ...album, tracks: [], coverArt: album.coverArt.sources };
          delete album.playability;
          return album;
        })
      )[0]

      /* Ordenar álbumes de forma cronológica */
      .sort((a: any, b: any) => a.date.isoString.localeCompare(b.date.isoString));
      
    /* -------------------------------------------------------------------------------------------- */
    /* --- LISTA DE CANCIONES --------------------------------------------------------------------- */
    /* -------------------------------------------------------------------------------------------- */

    let topTracks = json.log.entries
      /* Filtrar las peticiones de canciones */
      .filter((entry: any) => entry.request.url.includes('query?operationName=queryAlbumTracks') && entry.response.content.text)
      /* Obtener listado de canciones por álbum interrelacionando álbumes y canciones */
      .map((entry: any) => {
        let entryUrl = entry.request.url;
        entry = JSON.parse(entry.response.content.text).data.albumUnion.tracks.items.map((song: any) => song.track);
        discographyAlbums.forEach((album: any) => {
          if(entryUrl.includes(album.id)){
            /* Añadir álbumes sin canciones a las canciones de la lista de canciones */
            entry.forEach((song: any) => {
              song.album = { ...album, tracks: [] };
              return song;
            });
            /* Añadir canciones sin álbum a los álbumes de la lista de álbumes */
            album.tracks = entry.map((song: any) => {
              song = { ...song, artists: song.artists.items, associatedVideos: song.associations.associatedVideos, 
                playcount: parseInt(song.playcount), duration: song.duration.totalMilliseconds };
              delete song.album;
              delete song.associations;
              delete song.discNumber;
              delete song.relinkingInformation;
              delete song.saved;
              delete song.playability;
              delete song.contentRating;
              return song;
            });
          }
          return album;
        });
        return entry;
      })
      /* Obtener listado de canciones */
      .reduce((res: any[], album: any) => res = [ ...res, ...album ], [])
      /* Modificar estructura de las canciones */
      .map((song: any) => {
        song = { ...song, artists: song.artists.items, associatedVideos: song.associations.associatedVideos, 
          playcount: parseInt(song.playcount), duration: song.duration.totalMilliseconds };
        delete song.associations;
        delete song.discNumber;
        delete song.relinkingInformation;
        delete song.saved;
        delete song.playability;
        delete song.contentRating;
        return song;
      })
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
          let sortName = group.sort((a: any, b: any) => a.name.length - b.name.length)[0].name;
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
    
    /* -------------------------------------------------------------------------------------------- */
    /* --- TOP 10 DE CANCIONES -------------------------------------------------------------------- */
    /* -------------------------------------------------------------------------------------------- */

    artistOverview.topTracks.forEach((topSong: any) => {
      let album = topTracks.reduce((res: any, song: any) => { //TODO Arreglar álbumes vacíos
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