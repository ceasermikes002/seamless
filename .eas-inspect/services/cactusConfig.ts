export const CactusConfig = {
  textModel: process.env.EXPO_PUBLIC_CACTUS_TEXT_MODEL && process.env.EXPO_PUBLIC_CACTUS_TEXT_MODEL.trim() ? process.env.EXPO_PUBLIC_CACTUS_TEXT_MODEL.trim() : undefined,
  visionModel: process.env.EXPO_PUBLIC_CACTUS_VISION_MODEL && process.env.EXPO_PUBLIC_CACTUS_VISION_MODEL.trim() ? process.env.EXPO_PUBLIC_CACTUS_VISION_MODEL.trim() : 'lfm2-vl-450m',
};

