const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');

/**
 * Triggered from a change to a Cloud Storage bucket.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */

exports.generateThumbnail = async (event, context) => {
  console.log('===================================');
  console.log(`event: ${JSON.stringify(event)}`);
  console.log(`context: ${JSON.stringify(context)}`);
  console.log('===================================');

  if (event.name.includes('thumb/')) return;

  const storage = new Storage().bucket(event.bucket);
  const prefix = event.name.split('/origin/')[0];
  const postfix = event.name.split('/origin/')[1];

  await Promise.all(
    [
      { size: 320, fname: `${prefix}/thumb/s/${postfix}` },
      { size: 640, fname: `${prefix}/thumb/m/${postfix}` },
      { size: 1280, fname: `${prefix}/thumb/l/${postfix}` },
    ].map(e => {
      return new Promise((resolve, reject) => {
        storage
          .file(event.name)
          .createReadStream()
          .pipe(sharp().resize(e.size))
          .pipe(storage.file(`${e.fname}`).createWriteStream())
          .on('finish', () => resolve())
          .on('error', () => reject());
      });
    }),
  );
};
