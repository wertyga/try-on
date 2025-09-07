import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const storage = new Storage();
