import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  PreferredProductCategories: 'PreferredProductCategories',
};

class Storage {
  async set(name: string, value: any) {
    await AsyncStorage.setItem(name, JSON.stringify(value));
  }

  async get(name: string) {
    const value = await AsyncStorage.getItem(name);

    return value != null ? JSON.parse(value) : null;
  }

  async delete(name: string) {
    await AsyncStorage.removeItem(name);
  }

  async clearAll() {
    await AsyncStorage.clear();
  }
}

class AppAsyncStorage extends Storage {
  get preferredProductCategories(): Promise<string[]> {
    return this.get(STORAGE_KEYS.PreferredProductCategories) ?? [];
  }

  set preferredProductCategories(value: string[]) {
    this.set(STORAGE_KEYS.PreferredProductCategories, value);
  }
}

export const storage = new AppAsyncStorage();
