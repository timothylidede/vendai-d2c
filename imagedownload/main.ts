import { downloadProductImages } from './downloadProductImages';

const products = [
  'Fanta Orange 500ml',
  'CocaCola 1L',
  'Sprite 330ml'
] as const;

downloadProductImages(products)
  .then(() => console.log('All downloads completed'))
  .catch((error) => console.error('Error:', error.message));
