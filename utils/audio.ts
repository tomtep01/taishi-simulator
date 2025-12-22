
// Audio assets - using reliable public domain sounds where possible
// Note: In a production environment, these should be served from your own CDN/assets folder
const ASSETS = {
  // Smooth Jazz Loop
  BGM: 'https://cdn.pixabay.com/download/audio/2022/02/10/audio_fc8c887259.mp3?filename=lounge-bossanova-soft-background-music-10657.mp3',
  // Poker Chip Click
  CHIP: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=chips-handling-19253.mp3',
  // Dice Shake/Roll
  ROLL: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_145802272e.mp3?filename=dice-rolling-on-table-30046.mp3',
  // Win/Coins
  WIN: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=jackpot-coin-sound-effect-3-22806.mp3',
  // Reveal/Settle
  SETTLE: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=chips-handling-19253.mp3' // Reusing chip for settle for now or finding another
};

class AudioManager {
  private bgm: HTMLAudioElement | null = null;
  private sfxEnabled: boolean = true;
  private musicEnabled: boolean = false; // Default off until interaction
  private sounds: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    this.preload();
  }

  private preload() {
    try {
      this.bgm = new Audio(ASSETS.BGM);
      this.bgm.loop = true;
      this.bgm.volume = 0.3;

      this.sounds.set('chip', new Audio(ASSETS.CHIP));
      this.sounds.set('roll', new Audio(ASSETS.ROLL));
      this.sounds.set('win', new Audio(ASSETS.WIN));
      this.sounds.set('settle', new Audio(ASSETS.SETTLE));
    } catch (e) {
      console.warn('Audio initialization failed', e);
    }
  }

  public toggleMusic(enable: boolean) {
    this.musicEnabled = enable;
    if (this.bgm) {
      if (enable) {
        this.bgm.play().catch(e => console.log("Audio play failed (interaction required)", e));
      } else {
        this.bgm.pause();
      }
    }
  }

  public toggleSFX(enable: boolean) {
    this.sfxEnabled = enable;
    // If disabling SFX, stop all currently playing SFX
    if (!enable) {
      this.sounds.forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
      });
    }
  }

  public playChip() {
    this.play('chip', 0.5, true); // Allow overlap for chips
  }

  public playRoll() {
    this.play('roll', 0.8, false);
  }

  public playWin() {
    this.play('win', 0.6, false);
  }
  
  public playSettle() {
     this.play('settle', 0.4, false);
  }

  private play(key: string, volume: number = 1, allowOverlap: boolean = false) {
    if (!this.sfxEnabled) return;
    const sound = this.sounds.get(key);
    if (sound) {
      if (allowOverlap) {
        // Clone for polyphonic sounds (like chips rapidly clicked)
        const clone = sound.cloneNode() as HTMLAudioElement;
        clone.volume = volume;
        clone.play().catch(() => {});
      } else {
        // Singleton for monophonic sounds (win, roll) to prevent overlap
        sound.pause();
        sound.currentTime = 0;
        sound.volume = volume;
        sound.play().catch(() => {});
      }
    }
  }
}

export const audioManager = new AudioManager();
