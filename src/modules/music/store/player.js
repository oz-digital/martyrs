// store/player.js
import globalWebSocket from '@martyrs/src/modules/globals/views/classes/globals.websocket.js';
import { reactive } from 'vue';

// State
export const state = reactive({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 0.7,
  muted: false,
  currentTime: 0,
  duration: 0,
  repeat: 'none', // 'none', 'all', 'one'
  shuffle: false,
  initialQueue: [], // To keep original order when shuffle is toggled
  audioElement: null,
  audioContext: null,
  listeningPartyId: null,
  syncInProgress: false,
});

// Actions
export const actions = {
  initializeAudio() {
    if (typeof window !== 'undefined') {
      if (!state.audioElement) {
        state.audioElement = new Audio();
        state.audioElement.volume = state.volume;

        // Set up audio context if available
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            state.audioContext = new AudioContext();
          }
        } catch (e) {
          console.error('AudioContext not supported', e);
        }

        // Add event listeners
        state.audioElement.addEventListener('timeupdate', () => {
          state.currentTime = state.audioElement.currentTime;

          // Sync playback with listening party every 5 seconds
          if (state.listeningPartyId && !state.syncInProgress && state.isPlaying && state.currentTime % 5 < 0.1) {
            this.syncPartyPlayback();
          }
        });

        state.audioElement.addEventListener('loadedmetadata', () => {
          state.duration = state.audioElement.duration;
        });

        state.audioElement.addEventListener('ended', () => {
          this.playNext();
        });

        state.audioElement.addEventListener('play', () => {
          state.isPlaying = true;
        });

        state.audioElement.addEventListener('pause', () => {
          state.isPlaying = false;
        });
      }
    }
  },

  async playTrack(track) {
    if (!state.audioElement) {
      this.initializeAudio();
    }

    // If track is already playing, just toggle play/pause
    if (state.currentTrack && state.currentTrack._id === track._id) {
      return this.togglePlay();
    }

    // Set the current track
    state.currentTrack = track;

    // Generate stream URL
    const streamUrl = `${process.env.API_URL}/api/stream/${track._id}`;

    // Set up audio element
    state.audioElement.src = streamUrl;
    state.audioElement.load();
    const playPromise = state.audioElement.play();

    // Handle autoplay restrictions
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('Autoplay prevented:', error);
        state.isPlaying = false;
      });
    }

    // Log play via WebSocket if connected
    console.log('Player: Attempting to log play event for track:', track._id);
    console.log('Player: WebSocket connected?', globalWebSocket.isSocketConnected());
    
    if (globalWebSocket.isSocketConnected()) {
      console.log('Player: Sending startPlaying event via WebSocket');
      globalWebSocket.send({
        module: 'music-streaming',
        action: 'startPlaying',
        data: {
          trackId: track._id,
          from: 'player',
          deviceInfo: navigator.userAgent,
        },
      });
    } else {
      console.log('Player: WebSocket not connected, play count will not be incremented');
    }
  },

  togglePlay() {
    if (!state.currentTrack || !state.audioElement) return;

    if (state.isPlaying) {
      state.audioElement.pause();
    } else {
      state.audioElement.play().catch(error => {
        console.error('Play failed:', error);
      });
    }

    state.isPlaying = !state.isPlaying;

    // Sync with listening party if active
    if (state.listeningPartyId) {
      this.syncPartyPlayback();
    }
  },

  setVolume(volume) {
    state.volume = volume;
    if (state.audioElement) {
      state.audioElement.volume = volume;
    }
  },

  toggleMute() {
    state.muted = !state.muted;
    if (state.audioElement) {
      state.audioElement.muted = state.muted;
    }
  },

  seek(time) {
    if (state.audioElement) {
      state.audioElement.currentTime = time;
      state.currentTime = time;

      // Sync with listening party if active
      if (state.listeningPartyId) {
        this.syncPartyPlayback();
      }
    }
  },

  // Queue management
  setQueue(tracks, startIndex = 0) {
    state.queue = [...tracks];
    state.initialQueue = [...tracks];

    if (startIndex > 0 && startIndex < tracks.length) {
      // Rearrange queue to start from the selected track
      const tracksToPlay = state.queue.splice(startIndex);
      state.queue = [...tracksToPlay, ...state.queue];
    }

    // If shuffle is on, randomize the queue except the first track
    if (state.shuffle && state.queue.length > 1) {
      const firstTrack = state.queue[0];
      const remainingTracks = state.queue.slice(1);
      this.shuffleArray(remainingTracks);
      state.queue = [firstTrack, ...remainingTracks];
    }

    // Start playing the first track in queue
    if (state.queue.length > 0) {
      this.playTrack(state.queue[0]);
    }
  },

  addToQueue(track) {
    state.queue.push(track);
    state.initialQueue.push(track);

    // If nothing is playing, start this track
    if (!state.currentTrack) {
      this.playTrack(track);
    }
  },

  removeFromQueue(index) {
    if (index >= 0 && index < state.queue.length) {
      state.queue.splice(index, 1);
    }
  },

  clearQueue() {
    state.queue = [];
    state.initialQueue = [];

    if (state.audioElement) {
      state.audioElement.pause();
      state.audioElement.src = '';
    }

    state.currentTrack = null;
    state.isPlaying = false;
  },

  playNext() {
    if (state.queue.length <= 1) {
      // Only one track or empty queue
      if (state.repeat === 'one' || state.repeat === 'all') {
        // Replay the current track
        this.seek(0);
        state.audioElement.play().catch(e => console.error(e));
      } else {
        // Stop playback
        state.isPlaying = false;
      }
      return;
    }

    if (state.repeat !== 'one') {
      // Move to next track
      state.queue.shift(); // Remove current track from queue

      // If queue is empty after removing current track and repeat is on
      if (state.queue.length === 0 && state.repeat === 'all') {
        state.queue = [...state.initialQueue];
      }

      // Play the next track if available
      if (state.queue.length > 0) {
        this.playTrack(state.queue[0]);
      } else {
        state.currentTrack = null;
        state.isPlaying = false;
      }
    } else {
      // Repeat one - just seek to beginning
      this.seek(0);
      state.audioElement.play().catch(e => console.error(e));
    }
  },

  playPrevious() {
    // If we're more than 3 seconds into the track, restart it
    if (state.currentTime > 3) {
      this.seek(0);
      return;
    }

    // Otherwise go to previous track if we have history
    // Implementation depends on how track history is managed
    // For simplicity, let's just go back to the beginning of the current track
    this.seek(0);
  },

  toggleRepeat() {
    // Cycle through repeat modes: none -> all -> one -> none...
    if (state.repeat === 'none') {
      state.repeat = 'all';
    } else if (state.repeat === 'all') {
      state.repeat = 'one';
    } else {
      state.repeat = 'none';
    }
  },

  toggleShuffle() {
    state.shuffle = !state.shuffle;

    if (state.shuffle) {
      // Save the current track
      const currentTrack = state.queue[0];

      // Shuffle the rest of the queue
      const remainingTracks = state.queue.slice(1);
      this.shuffleArray(remainingTracks);

      // Reconstruct queue with current track at the front
      state.queue = [currentTrack, ...remainingTracks];
    } else {
      // Restore original order but keep current track at front
      if (state.currentTrack) {
        const currentTrackIndex = state.initialQueue.findIndex(track => track._id === state.currentTrack._id);

        if (currentTrackIndex !== -1) {
          const tracksToPlay = state.initialQueue.slice(currentTrackIndex);
          const previousTracks = state.initialQueue.slice(0, currentTrackIndex);
          state.queue = [...tracksToPlay, ...previousTracks];
        } else {
          state.queue = [...state.initialQueue];
        }
      } else {
        state.queue = [...state.initialQueue];
      }
    }
  },

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  // Listening party features
  joinListeningParty(partyId) {
    state.listeningPartyId = partyId;

    if (globalWebSocket.isSocketConnected()) {
      globalWebSocket.send({
        module: 'music-streaming',
        action: 'joinListeningParty',
        data: { partyId },
      });

      // Set up event listener for party playback sync
      globalWebSocket.addEventListener('partyPlaybackSync', this.handlePartySync.bind(this), {
        module: 'music-streaming',
      });
    }
  },

  leaveListeningParty() {
    state.listeningPartyId = null;

    // Remove event listener for party sync
    if (globalWebSocket.isSocketConnected()) {
      globalWebSocket.removeEventListener('partyPlaybackSync');
    }
  },

  syncPartyPlayback() {
    if (!state.listeningPartyId || !state.currentTrack || !globalWebSocket.isSocketConnected()) {
      return;
    }

    globalWebSocket.send({
      module: 'music-streaming',
      action: 'syncPartyPlayback',
      data: {
        trackId: state.currentTrack._id,
        position: state.currentTime,
        isPlaying: state.isPlaying,
      },
    });
  },

  handlePartySync(data) {
    if (!state.listeningPartyId) return;

    state.syncInProgress = true;

    // If different track is playing in the party
    if (data.trackId !== state.currentTrack?._id) {
      // Find track in queue or load it
      const trackInQueue = state.queue.find(track => track._id === data.trackId);

      if (trackInQueue) {
        this.playTrack(trackInQueue);
      } else {
        // Need to fetch the track from the API
        fetch(`${process.env.API_URL}/api/tracks/${data.trackId}`)
          .then(response => response.json())
          .then(track => {
            this.playTrack(track);
          })
          .catch(error => {
            console.error('Error fetching party track:', error);
          });
      }
    }

    // Sync playback position with some tolerance (2 seconds)
    if (Math.abs(state.currentTime - data.position) > 2) {
      this.seek(data.position);
    }

    // Sync play/pause state
    if (state.isPlaying !== data.isPlaying) {
      this.togglePlay();
    }

    // Reset sync flag after a short delay
    setTimeout(() => {
      state.syncInProgress = false;
    }, 1000);
  },
};
