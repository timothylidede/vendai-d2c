import { downloadProductImages } from './downloadProductImages';

const products = [
  'MOLO MILK 500ML',
  'ARIMIS 90ml milking jelly',
  'Sprite 330ml'
] as const;

downloadProductImages(products)
  .then(() => console.log('All downloads completed'))
  .catch((error) => console.error('Error:', error.message));
