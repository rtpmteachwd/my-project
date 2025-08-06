export class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: { [key: string]: AudioBuffer } = {};

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API is not supported in this browser');
    }
  }

  // Generate simple beep sounds using Web Audio API
  private createBeep(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer {
    if (!this.audioContext) {
      throw new Error('AudioContext not available');
    }

    const sampleRate = this.audioContext.sampleRate;
    const numFrames = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, numFrames, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.3;
    }

    return buffer;
  }

  // Preload sounds
  public async init() {
    if (!this.audioContext) return;

    try {
      // Create different beep sounds for different events
      this.sounds.buzz = this.createBeep(800, 0.2, 'square');
      this.sounds.correct = this.createBeep(523, 0.3, 'sine'); // C5 note
      this.sounds.wrong = this.createBeep(200, 0.5, 'sawtooth');
      this.sounds.notification = this.createBeep(1000, 0.1, 'sine');
      this.sounds.start = this.createBeep(440, 0.2, 'sine'); // A4 note
      this.sounds.end = this.createBeep(330, 0.4, 'triangle'); // E4 note
    } catch (error) {
      console.warn('Failed to initialize sounds:', error);
    }
  }

  // Play a sound by name
  public play(soundName: string) {
    if (!this.audioContext || !this.sounds[soundName]) {
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.sounds[soundName];
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.warn(`Failed to play sound ${soundName}:`, error);
    }
  }

  // Play sound with user interaction requirement
  public playWithInteraction(soundName: string) {
    // Resume audio context if suspended (required by browsers)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        this.play(soundName);
      });
    } else {
      this.play(soundName);
    }
  }
}

// Global sound manager instance
export const soundManager = new SoundManager();

// Initialize sounds on page load
if (typeof window !== 'undefined') {
  // Initialize on first user interaction
  const initSoundsOnInteraction = () => {
    soundManager.init();
    document.removeEventListener('click', initSoundsOnInteraction);
    document.removeEventListener('touchstart', initSoundsOnInteraction);
  };
  
  document.addEventListener('click', initSoundsOnInteraction);
  document.addEventListener('touchstart', initSoundsOnInteraction);
}