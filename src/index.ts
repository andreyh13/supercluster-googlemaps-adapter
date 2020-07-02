export class Loader {
  public static async getClusterer(): Promise<any> {
    if (google && google.maps) {
      const module = await import('./clusterer');
      return module.SuperClusterAdapter;
    } else {
      // eslint-disable-next-line no-console
      console.error('Google Maps JavaScript API v3 is not loaded. Cannot initialize SuperClusterAdapter.');
      return undefined;
    }
  }
}
