const controllerFactory = db => {
  const Department = db.department;
  const readOne = (req, res) => {
    Department.findOne({ _id: req.params._id })
      .populate('members.user')
      .populate('subdepartments')
      .then(department => {
        if (!department) {
          return res.status(404).send({ message: 'Отдел не найден' });
        }
        res.send(department);
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  };
  const read = (req, res) => {
    let query = {};
    let options = {};
    if (req.query.organization) {
      query.organization = new db.mongoose.Types.ObjectId(req.query.organization);
    }
    if (req.query.hidden) {
      query.hidden = req.query.hidden;
    }
    Department.find(query, null, options)
      .populate('members.user')
      .populate('subdepartments')
      .then(departments => {
        if (!departments) {
          return res.status(404).send({ message: 'Departments not found' });
        }
        res.send(departments);
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  };
  const create = async (req, res) => {
    try {
      const newDepartment = new Department({
        ...req.body,
        organization: req.params._id,
      });
      const data = await newDepartment.save();
      res.send(data);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };
  const update = (req, res) => {
    Department.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true })
      .then(department => {
        if (!department) {
          return res.status(404).send({ message: 'Department not found' });
        }
        res.send(department);
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  };
  const deleteDepartment = (req, res) => {
    Department.findOneAndRemove({ _id: req.body._id, organization: req.params._id })
      .then(department => {
        if (!department) {
          return res.status(404).send({ message: 'Department not found' });
        }
        res.send({ message: 'Department deleted successfully' });
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  };
  return {
    readOne,
    read,
    create,
    update,
    delete: deleteDepartment,
  };
};
export default controllerFactory;
