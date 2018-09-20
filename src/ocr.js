import isEmpty from 'lodash/fp/isEmpty';
import path from 'path';
import rp from 'request-promise-native';
import tesseractjs from 'tesseract.js';

const Tesseract = tesseractjs.create({
  workerPath: path.join(__dirname, '../lib/tesseract/src/node/worker.js'),
  langPath: path.join(__dirname, '../lib/tesseract/lang/'),
  corePath: path.join(__dirname, '../lib/tesseract/src/core.js'),
});

module.exports.ocr = (event, context, callback) => {
  if (!isEmpty(event.queryStringParameters)) {
    const imageURL = event.queryStringParameters.image_url;

    rp(imageURL, { encoding: null })
      .then(data => Tesseract.recognize(data))
      .then((result) => {
        console.log(`Tesseract is done recognizing...result: ${result.text}`);

        Tesseract.terminate();

        callback(null, {
          statusCode: 200,
          body: JSON.stringify({ result: result.text }),
        });
      })
      .catch((error) => {
        const errorMessage = `[ERROR] Error requesting image URL '${imageURL}' 
          because: ${JSON.stringify(error, null, 2)}.`;
        console.log(errorMessage);

        if (error.name === 'RequestError') {
          const statusCode = 400;
          callback(null, {
            statusCode,
            body: JSON.stringify({ statusCode, error: errorMessage }),
          });
        } else {
          const statusCode = 500;
          callback(null, {
            statusCode,
            body: JSON.stringify({ statusCode, error: errorMessage }),
          });
        }
      });
  }
};
