import stream from '../controllers/stream.controller.js';
export default (function (app, db, origins, publicPath) {
  console.log('rouus publioc is', publicPath);
  const controller = stream(app, db, publicPath);
  // Stream audio
  app.get('/api/stream/:trackId', controller.streamAudio);
  // WaveForm data for visualization
  app.get('/api/waveform/:trackId', async (req, res) => {
    try {
      const track = await db.track.findById(req.params.trackId);
      if (!track) {
        return res.status(404).json({ error: 'Track not found' });
      }
      // Check if waveform data exists (assuming it's preprocessed)
      const waveformPath = path.join(process.env.FILE_STORAGE_PATH || './uploads', `waveforms/${track._id}.json`);
      if (fs.existsSync(waveformPath)) {
        const waveformData = JSON.parse(fs.readFileSync(waveformPath, 'utf8'));
        return res.json(waveformData);
      }
      // If no waveform data, return error
      res.status(404).json({ error: 'Waveform data not found' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
});
