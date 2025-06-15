// middlewareFactory.js
const middlewareFactory = db => {
  const Blogpost = db.blogpost;
  const checkBlogpostExistOrNot = async (req, res, next) => {
    try {
      // Обработка URL
      const url = req.body.url
        ? req.body.url
        : req.body.name
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
      // Создание блога
      if (!req.body._id) {
        const blogpost = await Blogpost.findOne({ url });
        if (blogpost) {
          res.status(400).send({ errorCode: 'POST_URL_ALREADY_IN_USE', accessToken: null });
          return;
        }
        next();
        return;
      }
      // Обновление блога
      const updatingBlogpostId = req.body._id;
      const existingBlogpost = await Blogpost.findById(updatingBlogpostId);
      if (!existingBlogpost) {
        res.status(404).send({ errorCode: 'BLOGPOST_NOT_FOUND', accessToken: null });
        return;
      }
      if (existingBlogpost.url !== url) {
        const blogpost = await Blogpost.findOne({ url });
        if (blogpost) {
          res.status(400).send({ errorCode: 'POST_URL_ALREADY_IN_USE', accessToken: null });
          return;
        }
      }
      next();
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: err });
    }
  };
  const checkNameNotEmpty = (req, res, next) => {
    if (!req.body.name || req.body.name.trim() === '') {
      res.status(400).send({ errorCode: 'NAME_CANNOT_BE_EMPTY', accessToken: null });
      return;
    }
    next();
  };
  return {
    checkBlogpostExistOrNot,
    checkNameNotEmpty,
  };
};
export default middlewareFactory;
