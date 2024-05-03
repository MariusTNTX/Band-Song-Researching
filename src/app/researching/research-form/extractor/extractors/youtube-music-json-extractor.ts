import { closingData, closingError, setWarn } from "./extractor";

export function extractYouTubeMusicJSON(INPUT_CONTENT: any) {

  /* Datos básicos del extractor */
  const _DATA = {
    resource: 'YouTubeMusicJSONExtractor', //Título del extractor
    warnList: [], //Listado de warnings
  };

  /* Contenido de la respuesta */
  var content: any = { 
    id: '', 
    profile: { name: '', biography: '' }, 
    stats: { views: 0, subscriptions: 0 } 
  };

  /* Veríficar URL de procedencia */
  try {
    if(INPUT_CONTENT.log.pages.length === 0){
      return closingError(_DATA, 'El JSON introducido no contiene la URL de la página web. Por favor, recarga la página antes de comenzar a grabar');
    } else if(!INPUT_CONTENT.log.pages[0].title.includes('https://music.youtube.com/channel/')){
      return closingError(_DATA, 'El JSON introducido no proviene de la página web oficial');
    }
  } catch (error) {
    return closingError(_DATA, 'La estructura del JSON introducido no se corresponde con la esperada de la página web oficial', error);
  }

  /* Verificar peticiones y su contenido */
  if(!INPUT_CONTENT.log.entries.some((entry: any) => entry.request.url.includes('browse?prettyPrint=false') 
    && JSON.parse(entry?.response?.content?.text || '{}')?.header?.musicImmersiveHeaderRenderer?.description)){
    return closingError(_DATA, 'No se ha registrado ninguna petición sobre la cabecera o bien no contiene texto. Por favor, comienze a grabar desde la página principal del artista');
  }


  /* -------------------------------------------------------------------------------------------- */
  /* --- INFORMACIÓN DEL ARTISTA ---------------------------------------------------------------- */
  /* -------------------------------------------------------------------------------------------- */

  
  content.id = INPUT_CONTENT.log.pages[0].title.substring(INPUT_CONTENT.log.pages[0].title.lastIndexOf('/')+1);
  INPUT_CONTENT.log.entries
  .filter((entry: any) => entry.request.url.includes('browse?prettyPrint=false') 
                       && JSON.parse(entry?.response?.content?.text || '{}')?.header?.musicImmersiveHeaderRenderer)
  .map((entry: any) => JSON.parse(entry?.response?.content?.text || '{}'))
  .map((response: any) => { 
    let info = response?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents 
               || setWarn(_DATA, 'información de la banda no encontrada');
    console.log(response);
    content.profile.name = response?.header?.musicImmersiveHeaderRenderer?.title?.runs?.[0]?.text || setWarn(_DATA, 'nombre de la banda no encontrado'); 
    content.profile.biography = info?.[info.length-1]?.musicDescriptionShelfRenderer?.description?.runs?.[0]?.text 
                                || setWarn(_DATA, 'biografía de la banda no encontrada');
    content.stats.subscriptions = response?.header?.musicImmersiveHeaderRenderer?.subscriptionButton?.subscribeButtonRenderer?.subscriberCountText?.runs?.[0]?.text;
    content.stats.subscriptions = parseInt(content.stats.subscriptions?.replaceAll(/[\s\.]/g,'').replace('M','000000').replace('K','000')
                                  || setWarn(_DATA, 'biografía de la banda no encontrada', '0'));
    content.stats.views = parseInt(info?.[info.length-1]?.musicDescriptionShelfRenderer?.subheader?.runs?.[0]?.text?.replaceAll(/visualizaciones|\./g, '')?.trim() 
                          || setWarn(_DATA, 'biografía de la banda no encontrada', '0'));
  })?.[0];

  return closingData(_DATA, content);
}