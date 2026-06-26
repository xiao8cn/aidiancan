import '@testing-library/jest-dom'

type StoredRecord = Record<string, unknown>

class MemoryObjectStore {
  private readonly records: Map<string, StoredRecord>

  constructor(records: Map<string, StoredRecord>) {
    this.records = records
  }

  get(id: string) {
    const request = createRequest<StoredRecord | undefined>()
    queueMicrotask(() => {
      request.result = this.records.get(id)
      request.onsuccess?.({ target: request })
    })
    return request
  }

  put(value: StoredRecord) {
    const request = createRequest<StoredRecord>()
    queueMicrotask(() => {
      this.records.set(String(value.id), value)
      request.result = value
      request.onsuccess?.({ target: request })
    })
    return request
  }

  clear() {
    const request = createRequest<undefined>()
    queueMicrotask(() => {
      this.records.clear()
      request.result = undefined
      request.onsuccess?.({ target: request })
    })
    return request
  }
}

class MemoryDb {
  objectStoreNames = {
    contains: (name: string) => memoryStores.has(name),
  }

  createObjectStore(name: string) {
    if (!memoryStores.has(name)) memoryStores.set(name, new Map())
    return new MemoryObjectStore(memoryStores.get(name)!)
  }

  transaction(name: string) {
    if (!memoryStores.has(name)) memoryStores.set(name, new Map())
    const transaction = {
      objectStore: () => new MemoryObjectStore(memoryStores.get(name)!),
      oncomplete: null as ((event: Event) => void) | null,
      onerror: null as ((event: Event) => void) | null,
      error: null,
    }
    queueMicrotask(() => transaction.oncomplete?.(new Event('complete')))
    return transaction
  }

  close() {}
}

interface MemoryRequest<T> {
  result: T
  error: Error | null
  onsuccess: ((event: unknown) => void) | null
  onerror: ((event: unknown) => void) | null
  onupgradeneeded?: ((event: unknown) => void) | null
}

function createRequest<T>(): MemoryRequest<T> {
  return {
    result: undefined as T,
    error: null,
    onsuccess: null,
    onerror: null,
  }
}

const memoryStores = new Map<string, Map<string, StoredRecord>>()

Object.defineProperty(globalThis, 'indexedDB', {
  configurable: true,
  value: {
    open: () => {
      const request = createRequest<MemoryDb>()
      queueMicrotask(() => {
        request.result = new MemoryDb()
        request.onupgradeneeded?.({ target: request })
        request.onsuccess?.({ target: request })
      })
      return request
    },
  },
})
