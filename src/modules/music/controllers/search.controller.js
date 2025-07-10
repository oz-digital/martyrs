import Cache from '@martyrs/src/modules/globals/controllers/classes/globals.cache.js';
import Logger from '@martyrs/src/modules/globals/controllers/classes/globals.logger.js';
export default (function (app, db) {
  const logger = new Logger(db);
  const cache = new Cache();
  // Search across all music entities
  async function search(req, res) {
    try {
      const { query, type, limit = 10 } = req.query;
      if (!query || query.length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
      }
      const limitNum = parseInt(limit, 10);
      const cacheKey = `search:${query}:${type || 'all'}:${limitNum}`;
      // Try to get from cache first
      let results = await cache.get(cacheKey);
      if (!results) {
        results = {};
        // Create text search regex
        const searchRegex = new RegExp(query, 'i');
        // Filter queries based on type
        const types = type ? [type] : ['tracks', 'albums', 'artists', 'playlists', 'genres'];
        // Perform search for each requested type
        if (types.includes('tracks') || types.includes('all')) {
          results.tracks = await db.track
            .find({
              $or: [{ title: searchRegex }, { tags: searchRegex }],
              status: 'published',
              isPublic: true,
            })
            .populate('artist', 'name url photoUrl isVerified')
            .populate('album', 'title url coverArt')
            .populate('genre', 'name url')
            .limit(limitNum);
        }
        if (types.includes('albums') || types.includes('all')) {
          results.albums = await db.album
            .find({
              $or: [{ title: searchRegex }, { description: searchRegex }, { tags: searchRegex }],
              status: 'published',
              isPublic: true,
            })
            .limit(limitNum);
        }
        if (types.includes('artists') || types.includes('all')) {
          results.artists = await db.artist
            .find({
              $or: [{ name: searchRegex }, { bio: searchRegex }, { tags: searchRegex }],
              status: 'published',
            })
            .limit(limitNum);
        }
        if (types.includes('playlists') || types.includes('all')) {
          results.playlists = await db.playlist
            .find({
              $or: [{ title: searchRegex }, { description: searchRegex }, { tags: searchRegex }],
              isPublic: true,
            })
            .limit(limitNum);
        }
        if (types.includes('genres') || types.includes('all')) {
          results.genres = await db.genre
            .find({
              $or: [{ name: searchRegex }, { description: searchRegex }],
              status: 'published',
            })
            .limit(limitNum);
        }
        // Cache results for 10 minutes
        await cache.set(cacheKey, results, 600);
      }
      res.json(results);
    } catch (error) {
      logger.error(`Error searching: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
  return {
    search,
  };
});
