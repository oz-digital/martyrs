import busboy from 'busboy';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import sharp from 'sharp';
const convertToJpg = async filePath => {
  const metadata = await sharp(filePath).metadata();
  if (metadata.format === 'heic' || metadata.format === 'heif' || metadata.format === 'tiff' || metadata.format === 'bmp') {
    const jpgPath = filePath.replace(/\.[^.]+$/, '.jpg');
    await sharp(filePath).toFormat('jpeg').toFile(jpgPath);
    await fsp.unlink(filePath);
    filePath = jpgPath;
  }
  return filePath;
};
const createThumbnail = async originalPath => {
  const thumbnailPath = path.join(path.dirname(originalPath), 'thumbnail_' + path.basename(originalPath));
  try {
    const metadata = await sharp(originalPath).metadata();
    const resizeOptions = {};
    if (metadata.width > 512) {
      resizeOptions.width = 512;
    }
    await sharp(originalPath).rotate().resize(resizeOptions).toFile(thumbnailPath);
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw error;
  }
};
const handleFileUpload = (req, res, next, publicPath, { folderNameDefault = 'unsorted', maxSize = 10 * 1024 * 1024, allowedTypes = null }) => {
  let folderName = req.query.folderName || folderNameDefault;
  folderName = decodeURIComponent(folderName);
  folderName = folderName.startsWith('/') ? folderName : '/' + folderName;
  const filePath = path.join(publicPath, folderName);
  let files = [];
  let filesWrongSize = [];
  let filesWrongType = [];
  let fileProcessingPromises = []; // Массив для отслеживания промисов обработки файлов
  const bb = busboy({
    headers: req.headers,
    limits: { fileSize: maxSize },
  });
  bb.on('file', (name, file, info) => {
    console.log(`Received file: ${info.filename}, Type: ${info.mimeType}`);
    const isValidType = !allowedTypes || allowedTypes.includes(info.mimeType);
    if (!isValidType) {
      console.log(`File of wrong type: ${info.filename}`);
      filesWrongType.push(info.filename);
      file.resume();
      return;
    }
    const normalizeFileName = filename => {
      return (
        filename
          // Заменяем пробелы на подчеркивания
          .replace(/\s/g, '_')
          // Удаляем или заменяем небезопасные символы
          .replace(/[^a-zA-Z0-9-_.]/g, '')
          // Опционально: сокращаем имя файла, если оно слишком длинное
          .slice(0, 80)
      );
    };
    // Применяем нормализацию к имени файла
    const fileName = `${Math.floor(Math.random() * 10000)}-${normalizeFileName(info.filename)}`;
    let fileFullPath = path.join(filePath, fileName);
    const fileProcess = fsp.mkdir(path.dirname(fileFullPath), { recursive: true }).then(
      () =>
        new Promise((resolve, reject) => {
          const stream = file.pipe(fs.createWriteStream(fileFullPath));
          stream.on('finish', async () => {
            files.push(path.relative(publicPath, fileFullPath));
            resolve();
          });
          stream.on('error', reject);
        })
    );
    fileProcessingPromises.push(fileProcess);
    file.on('limit', () => {
      filesWrongSize.push(info.filename);
      fsp.unlink(fileFullPath).catch(err => console.error(`Error deleting oversized file: ${err.message}`));
    });
  });
  bb.on('finish', () => {
    Promise.all(fileProcessingPromises)
      .then(() => {
        console.log(`Upload finished. Files: ${files.length}, Wrong Size: ${filesWrongSize.length}, Wrong Type: ${filesWrongType.length}`);
        req.files = files;
        if (files.length === 0 && (filesWrongSize.length > 0 || filesWrongType.length > 0)) {
          let errorMessage = 'No files uploaded.';
          if (filesWrongSize.length > 0) {
            errorMessage += ' Some files were too large.';
          }
          if (filesWrongType.length > 0) {
            errorMessage += ' Some files were of an unsupported type.';
          }
          return res.status(400).json({ message: errorMessage });
        }
        next();
      })
      .catch(error => {
        console.error('Failed processing one or more files', error);
        res.status(500).json({ message: 'Error processing files' });
      });
  });
  req.pipe(bb);
};
const middlewareFactory = (db, publicPath) => {
  const generatePreviewMiddleware = async (req, res, next) => {
    const files = req.files;
    if (!files || files.length === 0) {
      return next();
    }
    try {
      await Promise.all(files.map(file => createThumbnail(path.join(publicPath, file))));
    } catch (error) {
      console.error('Error generating previews:', error);
      return res.status(500).json({ message: 'Internal server error while generating previews.' });
    }
    next();
  };
  const convertImagesMiddleware = async (req, res, next) => {
    const files = req.files;
    if (!files || files.length === 0) {
      return next();
    }
    try {
      req.files = await Promise.all(
        files.map(async file => {
          const convertedPath = await convertToJpg(path.join(publicPath, file));
          return path.relative(publicPath, convertedPath);
        })
      );
      next();
    } catch (error) {
      console.error('Error converting images or generating previews:', error);
      return res.status(500).json({ message: 'Internal server error while processing images.' });
    }
  };
  const uploadFilesMiddleware = (req, res, next) => {
    const allowedTypes = [
      // Images
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/heic',
      'image/heif',
      'image/webp',
      'image/tiff',
      'image/bmp',
      'image/svg+xml',
      // Video
      'video/mp4',
      'video/quicktime',
      'video/webm',
      // Audito
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/flac',
      'audio/aac',
      'audio/x-ms-wma',
      'audio/aiff',
    ];
    handleFileUpload(req, res, next, publicPath, {
      folderNameDefault: 'unsorted',
      maxSize: 100 * 1024 * 1024,
      allowedTypes,
    });
  };
  const uploadAudioMiddleware = (req, res, next) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/x-ms-wma', 'audio/aiff'];
    handleFileUpload(req, res, next, publicPath, {
      folderNameDefault: 'unsorted',
      maxSize: 10 * 1024 * 1024,
      allowedTypes,
    });
  };
  const uploadImagesMiddleware = (req, res, next) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/heic', 'image/heif', 'image/webp', 'image/tiff', 'image/bmp'];
    handleFileUpload(req, res, next, publicPath, {
      folderNameDefault: 'unsorted',
      maxSize: 10 * 1024 * 1024,
      allowedTypes,
    });
  };
  return {
    uploadImagesMiddleware,
    uploadAudioMiddleware,
    uploadFilesMiddleware,
    generatePreviewMiddleware,
    convertImagesMiddleware,
  };
};
export default middlewareFactory;
