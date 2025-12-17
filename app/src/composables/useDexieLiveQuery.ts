import { ref, onUnmounted, type Ref } from 'vue'
import { liveQuery } from 'dexie'

/**
 * Small helper around Dexie liveQuery for Vue.
 * It subscribes to a Dexie query function and keeps
 * a ref updated whenever the underlying IndexedDB data changes.
 */
export function useDexieLiveQuery<T>(
    queryFn: () => Promise<T> | T,
    initialValue: T,
): { data: Ref<T>; loading: Ref<boolean>; error: Ref<string | null> } {
    const data = ref<T>(initialValue) as Ref<T>
    const loading = ref(true)
    const error = ref<string | null>(null)

    const observable = liveQuery(queryFn)
    const subscription = observable.subscribe({
        next(value) {
            data.value = value
            loading.value = false
            error.value = null
        },
        error(err) {
            console.warn('[useDexieLiveQuery] Error', err)
            loading.value = false
            error.value = err?.message ?? 'Unexpected Dexie liveQuery error'
        },
    })

    onUnmounted(() => {
        subscription.unsubscribe()
    })

    return { data, loading, error }
}

