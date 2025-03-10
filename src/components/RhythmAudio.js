import { Howl } from 'howler';

export class RhythmAudio {
    constructor() {
        this.sounds = {};
        this.loadSounds();
    }

    loadSounds() {
        // Load drum sounds
        const drumSounds = ['kick', 'snare', 'hihat', 'tom', 'tamb', 'crash'];
        drumSounds.forEach(sound => {
            this.sounds[sound] = new Howl({
                src: [`/sounds/${sound}.mp3`],
                volume: 0.7
            });
        });
        
        // Load UI sounds
        this.sounds.countdown = new Howl({
            src: ['/sounds/countdown.mp3'],
            volume: 0.5
        });
        
        this.sounds.success = new Howl({
            src: ['/sounds/success.mp3'],
            volume: 0.5
        });
        
        this.sounds.fail = new Howl({
            src: ['/sounds/fail.mp3'],
            volume: 0.5
        });
        
        // Load background music
        this.sounds.bgm = new Howl({
            src: ['/sounds/bgm.mp3'],
            volume: 0.3,
            loop: true
        });
    }

    playSound(soundName, volume = null) {
        if (this.sounds[soundName]) {
            // Clone the sound to allow overlapping playback
            const soundId = this.sounds[soundName].play();
            
            // Adjust volume if specified
            if (volume !== null) {
                this.sounds[soundName].volume(volume, soundId);
            }
            
            return soundId;
        } else {
            console.warn(`Sound "${soundName}" not found`);
            return null;
        }
    }

    stopSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].stop();
        }
    }

    startBGM() {
        this.playSound('bgm');
    }

    stopBGM() {
        this.stopSound('bgm');
    }
} 