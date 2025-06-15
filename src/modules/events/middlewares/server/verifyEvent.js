// middlewareFactory.js
const middlewareFactory = db => {
  const Event = db.event; // Изменено с Blogpost на Event
  const checkEventExistOrNot = async (req, res, next) => {
    try {
      // Обработка URL
      const url = req.body.url
        ? req.body.url
        : req.body.name
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
      // Создание события
      if (!req.body._id) {
        // Логика создания события может отличаться от логики создания блога
        const event = await Event.findOne({ url }); // Изменено с Blogpost на Event
        if (event) {
          // Изменено с blogpost на event
          res.status(400).send({ errorCode: 'EVENT_URL_ALREADY_IN_USE', accessToken: null }); // Изменено с POST_URL_ALREADY_IN_USE на EVENT_URL_ALREADY_IN_USE
          return;
        }
        next();
        return;
      }
      // Обновление события
      const updatingEventId = req.body._id; // Изменено с updatingBlogpostId на updatingEventId
      const existingEvent = await Event.findById(updatingEventId); // Изменено с Blogpost на Event и с existingBlogpost на existingEvent
      if (!existingEvent) {
        // Изменено с existingBlogpost на existingEvent
        res.status(404).send({ errorCode: 'EVENT_NOT_FOUND', accessToken: null }); // Изменено с BLOGPOST_NOT_FOUND на EVENT_NOT_FOUND
        return;
      }
      if (existingEvent.url !== url) {
        // Изменено с existingBlogpost на existingEvent
        const event = await Event.findOne({ url }); // Изменено с Blogpost на Event и с blogpost на event
        if (event) {
          // Изменено с blogpost на event
          res.status(400).send({ errorCode: 'EVENT_URL_ALREADY_IN_USE', accessToken: null }); // Изменено с POST_URL_ALREADY_IN_USE на EVENT_URL_ALREADY_IN_USE
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
    checkEventExistOrNot, // Изменено с checkBlogpostExistOrNot на checkEventExistOrNot
    checkNameNotEmpty,
  };
};
export default middlewareFactory;
