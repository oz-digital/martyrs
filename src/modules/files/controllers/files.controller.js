const controllerFactory = (db, publicPath) => {
  const uploadMultipleFileController = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ message: 'No files uploaded.' });
    }
    const convertToRelativePath = absolutePath => {
      if (!absolutePath.startsWith('/')) {
        absolutePath = '/' + absolutePath;
      }
      return absolutePath;
    };
    req.files = req.files.map(file => convertToRelativePath(file));
    console.log(req.files);
    try {
      const fileResponses = req.files.map(file => ({
        message: 'File uploaded successfully.',
        filepath: file,
      }));
      res.status(200).send(fileResponses);
    } catch (error) {
      console.error('Error in uploadMultipleFileController:', error);
      return res.status(500).send({ message: 'Error during files processing.' });
    }
  };
  return {
    uploadMultipleFileController,
  };
};
export default controllerFactory;
