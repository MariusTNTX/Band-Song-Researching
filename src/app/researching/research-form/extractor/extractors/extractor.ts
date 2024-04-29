import { extractSpotifyJSON } from "./spotify-json-extractor";

export function extractData(
  INPUT_CONTENT: any, 
  INPUT_SOURCE: 'SPOTIFY' | 'SETLIST_FM' | 'LAST_FM' | 'YOUTUBE_MUSIC' | 'THETOPTENS' | 'CHATGPT', 
  INPUT_TYPE: 'JSON' | 'HTML' | 'TEXT')
{

  const RSR: string = 'extractor';

  /* Verificar contenido, fuente y tipo */
  if(!INPUT_CONTENT){
    return closingError(RSR, 'No se ha especificado el contenido del input');
  } else if(!INPUT_SOURCE){
    return closingError(RSR, 'No se ha especificado la fuente');
  } else if(!INPUT_TYPE){
    return closingError(RSR, 'No se ha especificado el tipo del input');
  }

  /* Switch de extractores según el tipo de input */
  switch(INPUT_SOURCE + '_' + INPUT_TYPE){
    case 'SPOTIFY_JSON': return extractSpotifyJSON(INPUT_CONTENT);
    case 'SPOTIFY_HTML': return closingError(RSR, 'El extractor de Spotify no soporta inputs de tipo HTML');
    case 'SPOTIFY_TEXT': return closingError(RSR, 'El extractor de Spotify no soporta inputs de tipo texto');
    default: return closingError(RSR, "Los parámetros introducidos en el extractor no son válidos");
  }
}

/* Constructor de resultData erróneos */
export function closingError(extractor: string, message: string){ 
  console.error(`${extractor}Error: `, message);
  return { ok: false, error: message, content: {} };
};

/* Constructor de resultData con contenido */
export function closingData(extractor: string, data: any){ 
  console.log(`${extractor}: `, 'La extracción de datos ha finalizado con éxito');
  return { ok: true, error: null, content: data };
};