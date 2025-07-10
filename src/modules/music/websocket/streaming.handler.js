import Logger from '@martyrs/src/modules/globals/controllers/classes/globals.logger.js';
export default (function (db) {
  const logger = new Logger(db);
  return {
    // Handle WebSocket messages for music streaming
    handleStreamingMessage: async (ws, message) => {
      try {
        console.log('StreamingHandler: Received message:', { action: message.action, data: message.data });
        const { action, data } = message;
        switch (action) {
          case 'startPlaying':
            console.log('StreamingHandler: Processing startPlaying event for track:', data.trackId, 'user:', ws.userId);
            // Log play event
            if (ws.userId && data.trackId) {
              await db.playHistory.create({
                user: ws.userId,
                track: data.trackId,
                playedAt: new Date(),
                deviceInfo: data.deviceInfo || 'Unknown',
                playedFrom: data.from || 'other',
                contextId: data.contextId || null,
              });
              console.log('StreamingHandler: Created play history record');
              
              // Increment play count
              const trackUpdate = await db.track.findByIdAndUpdate(data.trackId, { $inc: { playCount: 1 } }, { new: true });
              console.log('StreamingHandler: Updated track playCount to:', trackUpdate?.playCount);
              
              // Acknowledge
              ws.send(
                JSON.stringify({
                  type: 'playAcknowledged',
                  trackId: data.trackId,
                })
              );
            }
            break;
          case 'syncPosition':
            // Track playback position for potential resume later
            if (ws.userId && data.trackId && data.position) {
              // Find the latest play history entry
              const latestPlay = await db.playHistory
                .findOne({
                  user: ws.userId,
                  track: data.trackId,
                })
                .sort({ playedAt: -1 });
              if (latestPlay) {
                latestPlay.playDuration = data.position;
                await latestPlay.save();
              }
            }
            break;
          case 'getRecommendations':
            // Generate personalized recommendations
            if (ws.userId) {
              // Get user's recently played tracks
              const recentTracks = await db.playHistory
                .find({
                  user: ws.userId,
                })
                .sort({ playedAt: -1 })
                .limit(10)
                .populate('track');
              // Extract genres and artists from recently played
              const recentGenres = new Set();
              const recentArtists = new Set();
              recentTracks.forEach(history => {
                if (history.track) {
                  if (history.track.genre) {
                    history.track.genre.forEach(g => recentGenres.add(g.toString()));
                  }
                  if (history.track.artist) {
                    recentArtists.add(history.track.artist.toString());
                  }
                }
              });
              // Find recommendations based on genres and artists
              const recommendations = await db.track
                .find({
                  $or: [{ genre: { $in: Array.from(recentGenres) } }, { artist: { $in: Array.from(recentArtists) } }],
                  _id: { $nin: recentTracks.map(h => h.track._id) }, // Exclude recently played
                  status: 'published',
                  isPublic: true,
                })
                .limit(10)
                .populate('artist', 'name')
                .populate('album', 'title coverUrl');
              // Send recommendations to the client
              ws.send(
                JSON.stringify({
                  type: 'recommendations',
                  tracks: recommendations,
                })
              );
            }
            break;
          case 'joinListeningParty':
            // Implement a shared listening experience
            if (ws.userId && data.partyId) {
              // Join a room based on the party ID
              ws.listeningParty = data.partyId;
              // Broadcast to all users in the party that a new user joined
              global.webSocketManager.broadcastToModuleWithFilter('music-streaming', socket => socket.listeningParty === data.partyId, {
                type: 'partyMemberJoined',
                userId: ws.userId,
                partyId: data.partyId,
              });
            }
            break;
          case 'syncPartyPlayback':
            // Synchronize playback for listening party members
            if (ws.userId && ws.listeningParty && data.trackId && data.position) {
              // Broadcast current position to all users in the party
              global.webSocketManager.broadcastToModuleWithFilter('music-streaming', socket => socket.listeningParty === ws.listeningParty && socket !== ws, {
                type: 'partyPlaybackSync',
                trackId: data.trackId,
                position: data.position,
                isPlaying: data.isPlaying,
                timestamp: Date.now(),
              });
            }
            break;
          default:
            logger.info(`Unknown streaming action: ${action}`);
        }
      } catch (error) {
        logger.error(`Error in streaming handler: ${error.message}`);
        // Send error to client
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'An error occurred while processing your request',
          })
        );
      }
    },
  };
});
