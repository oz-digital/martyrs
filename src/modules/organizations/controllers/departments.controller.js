const controllerFactory = db => {
  const Department = db.department;
  const readOne = (req, res) => {
    Department.findOne({ _id: req.params._id })
      .populate('members.user', '-password')
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
  const read = async (req, res) => {
    try {
      const { skip = 0, limit = 10, organization, hidden, _id, search } = req.query;
      
      let query = {};
      if (_id) {
        query._id = _id;
      }
      if (organization) {
        query.organization = new db.mongoose.Types.ObjectId(organization);
      }
      if (hidden !== undefined) {
        query.hidden = hidden === 'true';
      }
      if (search) {
        query['profile.name'] = new RegExp(search, 'i');
      }

      const departments = await Department
        .find(query)
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .populate('members.user', '-password')
        .populate('subdepartments')
        .sort({ createdAt: -1 });
      
      res.send(departments);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };
  const create = async (req, res) => {
    try {
      const newDepartment = new Department({
        ...req.body,
        organization: req.body.organization || req.params._id,
      });
      const data = await newDepartment.save();
      const populated = await Department.findById(data._id)
        .populate('members.user', '-password')
        .populate('subdepartments');
      res.send(populated);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };
  const update = (req, res) => {
    Department.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true })
      .populate('members.user', '-password')
      .populate('subdepartments')
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
  const deleteDepartment = async (req, res) => {
    try {
      const { _id } = req.body;
      if (!_id) {
        return res.status(400).send({ message: 'Department ID is required' });
      }
      
      const department = await Department.findOneAndRemove({ _id });
      if (!department) {
        return res.status(404).send({ message: 'Department not found' });
      }
      
      res.send(department);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
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
