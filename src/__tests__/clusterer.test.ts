import { setupGoogleMapsAPIMock } from '../aux/mockgooglemapsapi';
import { Loader } from '../index';

beforeAll(() => {
  setupGoogleMapsAPIMock();
});

test('Clusterer loader', () => {
  expect(Loader.getClusterer()).toBeDefined();
});

test('Clusterer loader async call', async () => {
  const clusterer = await Loader.getClusterer();
  expect(clusterer).toBeDefined();
});
