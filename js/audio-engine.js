/**
 * LOST KOLKATA - Web Audio Archaeology Engine
 * Procedural synthesis for vintage Calcutta soundscapes:
 * Tram bells, Hooghly steam horns, monsoon rain, temple resonance, and Battala press.
 * Zero external audio dependencies; pure native Web Audio API.
 */

class SoundscapeEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isPlaying = false;
        
        // Channel Gains
        this.rainGain = null;
        this.droneGain = null;
        
        // Active source nodes
        this.rainNode = null;
        this.droneOsc1 = null;
        this.droneOsc2 = null;
        this.isMuted = false;
        
        this.listeners = [];
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Sub-gains
        this.rainGain = this.ctx.createGain();
        this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.rainGain.connect(this.masterGain);

        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.droneGain.connect(this.masterGain);
    }

    async startAmbient() {
        this.init();
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }

        if (this.isPlaying) return;
        this.isPlaying = true;

        const now = this.ctx.currentTime;

        // 1. Synthesize Continuous Monsoon Rain (Pink/Brown noise with filter)
        this.startRain(now);

        // 2. Synthesize Mystical Twilight Drone (Harmonics of Tanpura/Temple peace)
        this.startTwilightDrone(now);

        this.notifyState();
    }

    startRain(now) {
        // Generate 3 seconds of looped pink noise
        const bufferSize = this.ctx.sampleRate * 3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
            b6 = white * 0.115926;
        }

        this.rainNode = this.ctx.createBufferSource();
        this.rainNode.buffer = buffer;
        this.rainNode.loop = true;

        const rainFilter = this.ctx.createBiquadFilter();
        rainFilter.type = 'lowpass';
        rainFilter.frequency.setValueAtTime(850, now);

        this.rainNode.connect(rainFilter);
        rainFilter.connect(this.rainGain);

        this.rainGain.gain.setValueAtTime(0.001, now);
        this.rainGain.gain.exponentialRampToValueAtTime(0.25, now + 2);

        this.rainNode.start(now);
    }

    startTwilightDrone(now) {
        // Gentle meditative drone at D2 (73.4Hz) and A2 (110Hz)
        this.droneOsc1 = this.ctx.createOscillator();
        this.droneOsc2 = this.ctx.createOscillator();

        this.droneOsc1.type = 'sine';
        this.droneOsc1.frequency.setValueAtTime(73.4, now);

        this.droneOsc2.type = 'sine';
        this.droneOsc2.frequency.setValueAtTime(110.0, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, now);

        this.droneOsc1.connect(filter);
        this.droneOsc2.connect(filter);
        filter.connect(this.droneGain);

        this.droneGain.gain.setValueAtTime(0.001, now);
        this.droneGain.gain.exponentialRampToValueAtTime(0.08, now + 3);

        this.droneOsc1.start(now);
        this.droneOsc2.start(now);
    }

    stopAmbient() {
        if (!this.ctx || !this.isPlaying) return;
        const now = this.ctx.currentTime;

        this.rainGain.gain.exponentialRampToValueAtTime(0.0001, now + 1);
        this.droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 1);

        setTimeout(() => {
            if (this.rainNode) {
                try { this.rainNode.stop(); } catch(e){}
                this.rainNode = null;
            }
            if (this.droneOsc1) {
                try { this.droneOsc1.stop(); } catch(e){}
                this.droneOsc1 = null;
            }
            if (this.droneOsc2) {
                try { this.droneOsc2.stop(); } catch(e){}
                this.droneOsc2 = null;
            }
            this.isPlaying = false;
            this.notifyState();
        }, 1100);
    }

    toggleAmbient() {
        if (this.isPlaying) {
            this.stopAmbient();
        } else {
            this.startAmbient();
        }
    }

    setMasterVolume(val) {
        if (!this.masterGain || !this.ctx) return;
        this.masterGain.gain.setValueAtTime(val, this.ctx.currentTime);
    }

    /**
     * Play authentic vintage Calcutta Tram "Ting-Ting" Bell
     */
    playTramBell() {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const chime = (freq, startTime, duration) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            
            // Add subtle metallic overtone
            const overtone = this.ctx.createOscillator();
            const overGain = this.ctx.createGain();
            overtone.type = 'triangle';
            overtone.frequency.setValueAtTime(freq * 2.76, startTime);

            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            overGain.gain.setValueAtTime(0.08, startTime);
            overGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.4);

            osc.connect(gain);
            overtone.connect(overGain);
            gain.connect(this.masterGain);
            overGain.connect(this.masterGain);

            osc.start(startTime);
            overtone.start(startTime);
            osc.stop(startTime + duration);
            overtone.stop(startTime + duration);
        };

        // Two distinct "ting... ting!" chimes
        chime(1560, now, 0.45);
        chime(1780, now + 0.18, 0.6);
    }

    /**
     * Play vintage Hooghly River Steamer Foghorn
     */
    playSteamerHorn() {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const fundamental = 92.5; // F#1 deep horn

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const osc3 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(fundamental, now);

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(fundamental * 1.5, now); // Fifth

        osc3.type = 'triangle';
        osc3.frequency.setValueAtTime(fundamental * 2.01, now); // Octave with slight detune

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, now);
        filter.frequency.linearRampToValueAtTime(450, now + 1.2);
        filter.frequency.exponentialRampToValueAtTime(260, now + 3.2);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.8);
        gain.gain.setValueAtTime(0.35, now + 2.0);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

        osc1.connect(filter);
        osc2.connect(filter);
        osc3.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        osc1.stop(now + 3.6);
        osc2.stop(now + 3.6);
        osc3.stop(now + 3.6);
    }

    /**
     * Play sacred Temple Conch / Evening Bell
     */
    playTempleBell() {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const freqs = [440, 880, 1320, 1760];
        
        freqs.forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now);

            const initialVolume = 0.25 / (idx + 1);
            const decay = 2.5 + (3 - idx);

            gain.gain.setValueAtTime(initialVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + decay);
        });
    }

    /**
     * Play vintage Battala Wooden Printing Press Clack
     */
    playPressClick() {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notifyState() {
        this.listeners.forEach(cb => cb(this.isPlaying));
    }
}

window.soundEngine = new SoundscapeEngine();
