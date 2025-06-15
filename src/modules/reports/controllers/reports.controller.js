const controllerFactory = db => {
  const Report = db.report;
  const read = async (req, res) => {
    try {
      const reports = await Report.find({});
      if (reports.length === 0) {
        return res.status(404).json({ errorCode: 'REPORTS_NOT_FOUND' });
      }
      res.status(200).json(reports);
    } catch (err) {
      res.status(500).json({ errorCode: 'INTERNAL_SERVER_ERROR', message: err.message });
    }
  };
  const create = async (req, res) => {
    const newReport = new Report(req.body);
    try {
      const savedReport = await newReport.save();
      res.status(201).json(savedReport);
    } catch (err) {
      console.log(err);
      res.status(500).json({ errorCode: 'INTERNAL_SERVER_ERROR', message: err.message });
    }
  };
  const update = async (req, res) => {
    const { _id } = req.body;
    try {
      const updatedReport = await Report.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updatedReport) {
        return res.status(404).json({ errorCode: 'REPORT_NOT_FOUND' });
      }
      res.status(200).json(updatedReport);
    } catch (err) {
      res.status(500).json({ errorCode: 'INTERNAL_SERVER_ERROR', message: err.message });
    }
  };
  const deleteReport = async (req, res) => {
    const { _id } = req.body;
    try {
      const report = await Report.findOneAndDelete({ _id });
      if (!report) {
        return res.status(404).json({ errorCode: 'REPORT_NOT_FOUND' });
      }
      res.status(200).json({ message: 'Report deleted successfully.' });
    } catch (err) {
      res.status(500).json({ errorCode: 'INTERNAL_SERVER_ERROR', message: err.message });
    }
  };
  return {
    read,
    create,
    update,
    delete: deleteReport,
  };
};
export default controllerFactory;
