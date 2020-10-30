var path = require('path');


var googleTTS = require('./tts/index');



// start
module.exports = function(data) {
  googleTTS(data.text, data.lang, data.speed)
  .then(function (url) {
    console.log(url); // https://translate.google.com/translate_tts?...
    
    var dest = path.resolve(__dirname, `public/audios/${data.text}.mp3`); // file destination
    console.log('Download to ' + dest + ' ...');
    
    return downloadFile(url, dest);
  })
  .then(function () {
    console.log('Download success');
  })
  .catch(function (err) {
    console.error(err.stack);
  });
}