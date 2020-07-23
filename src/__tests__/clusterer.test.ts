import { setupGoogleMapsAPIMock } from '../aux/mockgooglemapsapi';
import { SuperClusterAdapterLoader } from '../index';

beforeAll(() => {
  setupGoogleMapsAPIMock();
});

test('Clusterer loader', () => {
  expect(SuperClusterAdapterLoader.getClusterer()).toBeDefined();
});

test('Clusterer loader async call', async () => {
  const clusterer = await SuperClusterAdapterLoader.getClusterer();
  expect(clusterer).toBeDefined();
});
