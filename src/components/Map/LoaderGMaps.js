// google-maps-loader.js
class GoogleMapsLoader {
  constructor() {
    this.loadPromise = null;
    this.google = null;
    this.currentOptions = null;
    this.initCallbacks = new Set();
  }

  load(apiKey, options = {}) {
    const defaultOptions = {
      version: 'weekly',
      libraries: ['places'],
      language: 'en',
    };

    this.currentOptions = { ...defaultOptions, ...options };
    const librariesParam = this.currentOptions.libraries.join(',');

    if (!this.loadPromise) {
      this.loadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${librariesParam}&v=${this.currentOptions.version}&language=${this.currentOptions.language}`;
        script.onload = () => {
          this.google = window.google.maps;
          this.initCallbacks.forEach(callback => callback(this.google));
          resolve(this.google);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    return this.loadPromise.then(() => {
      this._applyOptions(this.currentOptions);
      return this.google;
    });
  }

  _applyOptions(options) {
    if (this.google && this.currentOptions.language !== options.language) {
      this.google.setLanguage(options.language);
      this.currentOptions.language = options.language;
      this.reinitialize();
    }
  }

  reinitialize() {
    this.initCallbacks.forEach(callback => callback(this.google));
  }

  onInit(callback) {
    this.initCallbacks.add(callback);
    return () => {
      this.initCallbacks.delete(callback);
    };
  }

  updateOptions(newOptions) {
    this.currentOptions = { ...this.currentOptions, ...newOptions };
    this._applyOptions(this.currentOptions);
  }
}

export const googleMapsLoader = new GoogleMapsLoader();
