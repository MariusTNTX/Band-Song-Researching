export class MainExtractorError extends Error {

  origin = {
    resource: 'YoutubeMusicExtractor',
    warnList: [],
  };
  message = 'Error indeterminado';
  sentence = null;

  constructor(origin, error, message){
    super();
    this.origin = origin || this.origin;
    this.message = message || this.message;
    this.sentence = error.stack || error.message || this.sentence;
  }

  getErrorResponse(){
    return { 
      ok: false, 
      resource: this.origin.resource,
      warns: this.origin.warnList.length === 0 ? null : this.origin.warnList,
      error: { 
        message: this.message, 
        sentence: this.sentence 
      }, 
      content: null, 
    };
  }
}