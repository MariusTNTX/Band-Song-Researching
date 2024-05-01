import { extractSpotifyJSON } from "./spotify-json-extractor";

export function extractData(
  INPUT_CONTENT: any, 
  INPUT_SOURCE: 'SPOTIFY' | 'SETLIST_FM' | 'LAST_FM' | 'YOUTUBE_MUSIC' | 'THETOPTENS' | 'CHATGPT', 
  INPUT_TYPE: 'JSON' | 'HTML' | 'TEXT')
{

  /* Datos básicos del extractor */
  const _DATA = { 
    resource: 'MainExtractor', //Título del extractor
    warnList: [], //Listado de warnings
  };

  /* Verificar contenido, fuente y tipo */
  if(!INPUT_CONTENT){
    return closingError(_DATA, 'No se ha especificado el contenido del input');
  } else if(!INPUT_SOURCE){
    return closingError(_DATA, 'No se ha especificado la fuente');
  } else if(!INPUT_TYPE){
    return closingError(_DATA, 'No se ha especificado el tipo del input');
  }
  
  /* Switch de extractores según el tipo de input */
  switch(INPUT_TYPE){
    case 'JSON': 
      try { /* Verificación de tipo JSON */
        JSON.parse(JSON.stringify(INPUT_CONTENT));
      } catch (error) {
        return closingError(_DATA, 'El contenido introducido no es de tipo JSON', error);
      }
      switch(INPUT_SOURCE){
        case 'SPOTIFY': return extractSpotifyJSON(INPUT_CONTENT);
        case 'SETLIST_FM': return closingError(_DATA, 'El extractor de Setlist FM no soporta inputs de tipo JSON');
        case 'LAST_FM': return closingError(_DATA, 'El extractor de Last FM no soporta inputs de tipo JSON');
        case 'YOUTUBE_MUSIC': return closingError(_DATA, 'El extractor de YouTube Music no soporta inputs de tipo JSON');
        case 'THETOPTENS': return closingError(_DATA, 'El extractor de TheTopTens no soporta inputs de tipo JSON');
        case 'CHATGPT': return closingError(_DATA, 'El extractor de ChatGPT no soporta inputs de tipo JSON');
        default: return closingError(_DATA, "La fuente introducida en el extractor no es válida");
      }
    case 'HTML': 
      switch(INPUT_SOURCE){
        case 'SPOTIFY': return closingError(_DATA, 'El extractor de Spotify no soporta inputs de tipo HTML');
        case 'SETLIST_FM': return closingError(_DATA, 'El extractor de Setlist FM no soporta inputs de tipo HTML');
        case 'LAST_FM': return closingError(_DATA, 'El extractor de Last FM no soporta inputs de tipo HTML');
        case 'YOUTUBE_MUSIC': return closingError(_DATA, 'El extractor de YouTube Music no soporta inputs de tipo HTML');
        case 'THETOPTENS': return closingError(_DATA, 'El extractor de TheTopTens no soporta inputs de tipo HTML');
        case 'CHATGPT': return closingError(_DATA, 'El extractor de ChatGPT no soporta inputs de tipo HTML');
        default: return closingError(_DATA, "La fuente introducida en el extractor no es válida");
      }
    case 'TEXT': 
      switch(INPUT_SOURCE){
        case 'SPOTIFY': return closingError(_DATA, 'El extractor de Spotify no soporta inputs de tipo texto');
        case 'SETLIST_FM': return closingError(_DATA, 'El extractor de Setlist FM no soporta inputs de tipo texto');
        case 'LAST_FM': return closingError(_DATA, 'El extractor de Last FM no soporta inputs de tipo texto');
        case 'YOUTUBE_MUSIC': return closingError(_DATA, 'El extractor de YouTube Music no soporta inputs de tipo texto');
        case 'THETOPTENS': return closingError(_DATA, 'El extractor de TheTopTens no soporta inputs de tipo texto');
        case 'CHATGPT': return closingError(_DATA, 'El extractor de ChatGPT no soporta inputs de tipo texto');
        default: return closingError(_DATA, "La fuente introducida en el extractor no es válida");
      }
    default: return closingError(_DATA, "El tipo de input introducido en el extractor no es válido"); break;
  }
}

/* Constructor de resultData erróneos */
export function closingError(origin: any, message: string, sentence: any = null){ 
  console.error(`${origin.resource}Error:`, message);
  sentence && console.error(sentence);
  return { ok: false, error: { message, sentence }, content: null, resource: origin.resource };
};

/* Constructor de resultData con contenido */
export function closingData(origin: any, content: any){ 
  console.log(`${origin.resource}:`, 'La extracción de datos ha finalizado con éxito');
  let warns = origin.warnList.length === 0 ? null : origin.warnList;
  return { ok: true, error: null, warns, content, resource: origin.resource };
};

/* Gestor de warnings del resultData */
export function setWarn(origin: any, message: string, finalValue: any = null){ 
  if(origin.warnList.length === 0 || !origin.warnList.includes(message)){
    origin.warnList.push(message);
    console.warn(`${origin.resource}Warn:`, message);
  }
  return finalValue;
};

export class ExtractorError extends Error {
  constructor(message: string){ super(message) }
}