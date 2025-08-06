export class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {};

  constructor() {
    // Initialize sounds with base64 encoded simple audio or use public URLs
    this.sounds = {
      buzz: new Audio('/sounds/buzz.mp3'),
      correct: new Audio('/sounds/correct.mp3'),
      wrong: new Audio('/sounds/wrong.mp3'),
      notification: new Audio('/sounds/notification.mp3'),
      countdown: new Audio('/sounds/countdown.mp3'),
    };

    // Set volume for all sounds
    Object.values(this.sounds).forEach(sound => {
      sound.volume = 0.5;
    });

    // Preload sounds
    Object.values(this.sounds).forEach(sound => {
      sound.load();
    });
  }

  async play(soundName: keyof typeof this.sounds) {
    try {
      const sound = this.sounds[soundName];
      if (sound) {
        sound.currentTime = 0; // Reset to beginning
        await sound.play();
      }
    } catch (error) {
      console.warn(`Failed to play sound ${soundName}:`, error);
    }
  }

  setVolume(volume: number) {
    Object.values(this.sounds).forEach(sound => {
      sound.volume = Math.max(0, Math.min(1, volume));
    });
  }
}

// Global sound manager instance
export const soundManager = new SoundManager();