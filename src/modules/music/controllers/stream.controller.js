import coreabac from '@martyrs/src/modules/core/controllers/classes/core.abac.js';
import Logger from '@martyrs/src/modules/core/controllers/classes/core.logger.js';
import fs from 'fs';
import path from 'path';
export default (function (app, db, publicPath) {
  const { getInstance } = coreabac;
  const logger = new Logger(db);
  const abac = getInstance(db);
  // Stream track audio
  async function streamAudio(req, res) {
    try {
      const trackId = req.params.trackId;
      // Find track
      const track = await db.track.findById(trackId);
      if (!track) {
        return res.status(404).json({ error: 'Track not found' });
      }
      // Check access using ABAC
      const accessResult = await abac.checkAccess({
        user: req.userId,
        resource: 'tracks',
        action: 'read',
        currentResource: track,
      });
      if (!accessResult.allowed && !track.isPublic) {
        return res.status(403).json({
          errorCode: accessResult.reason,
          message: 'Access Denied',
        });
      }
      // Extract file path from fileUrl
      const fileUrl = track.fileUrl;
      const filePath = path.join(publicPath, fileUrl);
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        logger.error(`File not found: ${filePath}`);
        return res.status(404).json({ error: 'Audio file not found' });
      }
      // Get file stats
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;
      
      // Only count play on first request (not range requests)
      const isFirstRequest = !range || range === 'bytes=0-';
      
      if (req.userId) {
        try {
          await db.playHistory.create({
            user: req.userId,
            track: trackId,
            playedAt: new Date(),
            deviceInfo: req.headers['user-agent'],
            playedFrom: req.query.from || 'other',
            contextId: req.query.contextId || null,
          });
          // Increment playCount
          const updatedTrack = await db.track.findByIdAndUpdate(trackId, { $inc: { playCount: 1 } }, { new: true });
        } catch (error) {
          logger.error(`Error logging play history: ${error.message}`);
        }
      } else {
        try {
          const updatedTrack = await db.track.findByIdAndUpdate(trackId, { $inc: { playCount: 1 } }, { new: true });
        } catch (error) {
          logger.error(`Error incrementing playCount: ${error.message}`);
        }
      }
      // Handle range requests for audio streaming
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg',
        });
        file.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'audio/mpeg',
        });
        fs.createReadStream(filePath).pipe(res);
      }
    } catch (error) {
      logger.error(`Error streaming audio: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
  return {
    streamAudio,
  };
});
