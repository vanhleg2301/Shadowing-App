// The weekly recordings from My plan, kept in this browser (IndexedDB) so the learner can hear their progress
// without the audio ever leaving the device. One recording per week; saving again replaces it.

const DB_NAME = "plan-recordings";
const STORE = "recordings";

export interface PlanRecording {
  weekStart: string;
  title: string;
  savedAt: string;
  blob: Blob;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "weekStart" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = action(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export function isRecordingStoreSupported(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

export async function savePlanRecording(recording: PlanRecording): Promise<void> {
  await run("readwrite", (store) => store.put(recording));
}

// Newest week first.
export async function listPlanRecordings(): Promise<PlanRecording[]> {
  const all = await run<PlanRecording[]>("readonly", (store) => store.getAll());
  return all.sort((a, b) => b.weekStart.localeCompare(a.weekStart));
}

export async function deletePlanRecording(weekStart: string): Promise<void> {
  await run("readwrite", (store) => store.delete(weekStart));
}
