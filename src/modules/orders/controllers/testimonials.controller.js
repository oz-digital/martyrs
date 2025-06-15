import multer from 'multer';
import path from 'path';
import db from '../models.js';
const Testimonial = db.testimonial;
// Configure multer storage
const avatarsPath = path.join(__dirname, '../../public/avatars');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarsPath);
  },
  filename: function (req, file, cb) {
    // Generate a 6-digit random number
    const uniqueSuffix = Math.floor(100000 + Math.random() * 900000);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
export const read = (req, res) => {
  Testimonial.find()
    .then(testimonials => {
      if (!testimonials) {
        return res.status(404).send({ message: 'Testimonial not found.' });
      }
      res.status(200).send(testimonials);
    })
    .catch(err => {
      if (err) {
        return res.status(500).send({ message: err });
      }
    });
};
export const create = [
  upload.single('avatar'),
  async (req, res) => {
    try {
      const newTestimonial = {
        avatar: req.file.filename,
        rating: req.body.rating,
        name: req.body.name,
        position: req.body.position,
        description: req.body.description,
      };
      const testimonial = await Testimonial.create(newTestimonial);
      if (!testimonial) {
        return res.status(404).send({ message: 'Testimonial is not created.' });
      }
      res.status(200).send(testimonial);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error });
    }
  },
];
export const update = (req, res) => {
  Testimonial.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true })
    .exec()
    .then(testimonial => {
      if (!testimonial) {
        return res.status(404).send({ message: 'Something went wrong when updating testimonial.' });
      }
      res.status(200).send(testimonial);
    })
    .catch(err => {
      console.log(err);
      return res.status(500).send({ message: err });
    });
};
const delete$0 = (req, res) => {
  Testimonial.findOneAndDelete({ _id: req.params._id })
    .exec()
    .then(testimonial => {
      if (!testimonial) {
        return res.status(404).send({ message: 'Testimonial is not deleted.' });
      }
      res.status(200).send(testimonial);
    })
    .catch(err => {
      return res.status(500).send({ message: err });
    });
};
export { delete$0 as delete };
