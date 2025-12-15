import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PopupInstance } from '@/libraries/popup'

export const usePopupStore = defineStore('popup', () => {
    const popups = ref<PopupInstance[]>([])

    function addPopup(popup: PopupInstance) {
        popups.value.push(popup)
    }

    function removePopup(hash: string) {
        const index = popups.value.findIndex((p) => p.hash === hash)
        if (index !== -1) {
            popups.value.splice(index, 1)
        }
    }

    function clearAll() {
        popups.value = []
    }

    return {
        popups,
        addPopup,
        removePopup,
        clearAll,
    }
})
