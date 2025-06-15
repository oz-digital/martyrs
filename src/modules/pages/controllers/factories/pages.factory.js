const createPageController = db => {
  const Page = db.page;
  async function populateChildrenRecursively(page) {
    await page.populate('children');
    for (let child of page.children) {
      await populateChildrenRecursively(child);
    }
  }
  const create = async (req, res) => {
    try {
      const page = await Page.create(req.body);
      if (!page) {
        return res.status(404).send({ message: 'Something wrong when creating page.' });
      }
      if (req.body.parent) {
        const parentPage = await Page.findById(req.body.parent);
        if (parentPage) {
          if (!parentPage.children) {
            parentPage.children = [];
          }
          parentPage.children.push(page._id);
          await parentPage.save();
        } else {
          console.warn(`Parent page with id ${req.body.parent} not found.`);
        }
      }
      res.status(200).send(page);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };
  const read = async (req, res) => {
    try {
      const { url } = req.query;
      if (url) {
        // Fetch a single page
        const page = await Page.findOne({ url }).populate('parent');
        if (!page) {
          return res.status(404).json({ message: 'Page not found' });
        }
        await populateChildrenRecursively(page);
        res.status(200).send(page);
      } else {
        // Fetch all pages
        const topLevelPages = await Page.find({ parent: null });
        for (let page of topLevelPages) {
          await populateChildrenRecursively(page);
        }
        res.json(topLevelPages);
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  const update = async (req, res) => {
    try {
      const page = await Page.findOneAndUpdate({ _id: req.body._id }, req.body);
      if (!page) {
        return res.status(404).send({ message: 'Page not found.' });
      }
      res.status(200).send(page);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };
  const deletePage = async (req, res) => {
    try {
      const page = await Page.findOneAndDelete({ _id: req.body._id });
      if (!page) {
        return res.status(404).send({ message: 'Something wrong when deleting page.' });
      }
      res.status(200).send(page);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };
  return {
    create,
    read,
    update,
    delete: deletePage,
  };
};
export default createPageController;
