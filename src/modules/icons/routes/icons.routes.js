import { searchIcons, getIconById, downloadIconSvg, convertSvgToVueComponent, saveIconToDisk } from '../icons.server.js';

export default function iconsRoutes(app, db, origins, publicPath) {
  // Search icons endpoint with pagination
  app.post('/api/icons/search', async (req, res) => {
    try {
      const {
        search: term,
        limit = 50,
        next_page,
        prev_page
      } = req.body;

      if (!term) {
        return res.status(400).json({ error: 'Search term is required' });
      }

      // Remove "Icon" prefix from search term
      const cleanTerm = term.replace(/^Icon/i, '').trim();

      // Используем только token-based пагинацию
      const searchParams = { limit };

      if (next_page) {
        searchParams.next_page = next_page;
      } else if (prev_page) {
        searchParams.prev_page = prev_page;
      }

      const response = await searchIcons(cleanTerm, searchParams);

      res.json({
        success: true,
        icons: (response.icons || []).map(icon => ({
          id: icon.id,
          term: icon.term,
          preview_url: icon.thumbnail_url || icon.preview_url_84 || icon.preview_url_42,
          attribution: icon.attribution
        })),
        pagination: {
          next_page: response.next_page || null,
          prev_page: response.prev_page || null,
          total: response.total || 0
        }
      });
    } catch (error) {
      console.error('Error searching icons:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Save icon endpoint
  app.post('/api/icons/save', async (req, res) => {
    try {
      const { iconId, category, iconName, mode = 'add', currentIconName } = req.body;

      if (!iconId || !category || !iconName) {
        return res.status(400).json({ error: 'iconId, category, and iconName are required' });
      }

      const result = await saveIconToDisk(iconId, category, iconName, mode, currentIconName);
      res.json(result);
    } catch (error) {
      console.error('Error saving icon:', error);
      res.status(500).json({ error: error.message });
    }
  });
}