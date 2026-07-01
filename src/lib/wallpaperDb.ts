// IndexedDB storage utility for storing large local wallpaper files (images/videos)
// This avoids the 5MB localStorage limit and allows persistent custom background wallpapers.

const DB_NAME = "ChromeDashboardLocalDb";
const STORE_NAME = "Wallpapers";
const DB_VERSION = 1;

export interface LocalWallpaper {
  id: string;
  file: Blob;
  mimeType: string;
  updatedAt: number;
}

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

export async function saveLocalWallpaper(file: Blob): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const wallpaper: LocalWallpaper = {
      id: "current-local-wallpaper",
      file,
      mimeType: file.type,
      updatedAt: Date.now(),
    };

    const request = store.put(wallpaper);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getLocalWallpaper(): Promise<LocalWallpaper | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get("current-local-wallpaper");

    request.onsuccess = () => {
      resolve(request.result || null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteLocalWallpaper(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete("current-local-wallpaper");

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
