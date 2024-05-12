export function getNumber(rawText) {
  let sufix = rawText.includes('M') ? 1000000 : rawText.includes('K') ? 1000 : 1;
  let resultText = rawText.replaceAll(/de|visualizaciones|suscriptores|reproducciones|\&nbsp;|\s|\.|K|M/g, '') || 0;
  return parseInt(parseFloat(resultText.replace(/,/, '.')) * sufix + '');
}
export function getMilliseconds(rawText) {
  let num = rawText.split(':').map(time => parseInt(time));
  if (num.length === 2) num.unshift(0);
  return num[0] * 60 * 60 * 1000 + num[1] * 60 * 1000 + num[2] * 1000;
}

export function songsAreEqual(song1, song2) {
  let extrictMatch = song1.id === song2.id || (song1.playcount === song2.playcount &&
    (song2.name.toLowerCase().includes(song1.name.toLowerCase()) ||
      song1.name.toLowerCase().includes(song2.name.toLowerCase())));
  if (extrictMatch) return extrictMatch;
  else {
    let [title1, title2] = [song1, song2].map((song) => {
      let parts = song.name.toLowerCase().replaceAll(/&/g, 'and').replaceAll(/p(rt?)?\./g, 'part').replaceAll(/[,´'`]/g, '')
        .split(/ - |[\(\)\[\]]/).map((x) => x.trim());
      let title = [parts.shift()];
      parts.map((p) => p.startsWith('part') && title.push(p));
      return title.join(' ');
    });
    return title1 === title2;
  }
}

export function getArguments(initArgs, extraContent) {
  var args = { showBrowser: true, time: 1, ...extraContent };
  initArgs = initArgs.slice(2);
  initArgs.map((arg, i) => {
    if (i % 2 === 0) args[arg.replace('--', '')] = '';
    else args[initArgs[i - 1].replace('--', '')] = arg;
  });
  return args;
}

/* Constructor de resultData con contenido */
export function closingData(origin, content) {
  let warns = origin.warnList.length === 0 ? null : origin.warnList;
  return { ok: true, error: null, warns, content, resource: origin.resource };
};

/* Gestor de warnings del resultData */
export function setWarn(origin, message, finalValue = null) {
  if (origin.warnList.length === 0 || !origin.warnList.includes(message)) {
    origin.warnList.push(message);
    console.warn(`${origin.resource}Warn:`, message);
  }
  return finalValue;
};

export function sendFinalResponse(data){
  console.log(JSON.stringify(data, null, 2));
}