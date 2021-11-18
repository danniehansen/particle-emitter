import { ParticleEmitter, ParticleType } from ".";

const particleEmitter = new ParticleEmitter({
  debug: true,
  type: ParticleType.SNOW,
  multipliers: {
    spawning: {
      spawns: 1,
      rate: 1
    }
  }
});