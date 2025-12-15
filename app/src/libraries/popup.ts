import { shallowRef } from 'vue'
import type { Component } from 'vue'

/**
 * Popup/Modal management library
 * Based on NexoPOS popup pattern
 */

export interface PopupConfig {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    closeOnEscape?: boolean
    closeOnBackdrop?: boolean
}

export interface PopupInstance {
    hash: string
    component: any
    props: Record<string, any>
    config: PopupConfig
    close: (callback?: () => void) => void
}

class PopupManager {
    private popups: PopupInstance[] = []
    private listeners: ((popups: PopupInstance[]) => void)[] = []

    /**
     * Generate unique hash for popup
     */
    private hash(): string {
        return Math.random().toString(36).substring(2, 11)
    }

    /**
     * Open a popup
     */
    open(component: Component, params: Record<string, any> = {}, config: PopupConfig = {}): PopupInstance {
        const popup: PopupInstance = {
            hash: `popup-${this.hash()}-${this.hash()}`,
            component: shallowRef(component),
            props: params,
            config: {
                size: config.size || 'md',
                closeOnEscape: config.closeOnEscape !== false,
                closeOnBackdrop: config.closeOnBackdrop !== false,
            },
            close: (callback) => this.close(popup, callback),
        }

        this.popups.push(popup)
        this.notify()

        // Setup ESC key listener for first popup
        if (this.popups.length === 1 && popup.config.closeOnEscape) {
            this.setupEscapeListener()
        }

        return popup
    }

    /**
     * Close a popup
     */
    close(popup: PopupInstance, callback?: () => void) {
        const index = this.popups.findIndex((p) => p.hash === popup.hash)
        if (index !== -1) {
            this.popups.splice(index, 1)
            this.notify()

            if (callback) {
                callback()
            }

            // Remove ESC listener if no popups left
            if (this.popups.length === 0) {
                this.removeEscapeListener()
            }
        }
    }

    /**
     * Close all popups
     */
    closeAll() {
        this.popups = []
        this.notify()
        this.removeEscapeListener()
    }

    /**
     * Get all open popups
     */
    getPopups(): PopupInstance[] {
        return this.popups
    }

    /**
     * Subscribe to popup changes
     */
    subscribe(listener: (popups: PopupInstance[]) => void) {
        this.listeners.push(listener)
        return () => {
            const index = this.listeners.indexOf(listener)
            if (index !== -1) {
                this.listeners.splice(index, 1)
            }
        }
    }

    /**
     * Notify all listeners
     */
    private notify() {
        this.listeners.forEach((listener) => listener([...this.popups]))
    }

    /**
     * ESC key handler
     */
    private handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.popups.length > 0) {
            const lastPopup = this.popups[this.popups.length - 1]
            if (lastPopup.config.closeOnEscape) {
                this.close(lastPopup)
            }
        }
    }

    /**
     * Setup ESC key listener
     */
    private setupEscapeListener() {
        document.addEventListener('keydown', this.handleEscape)
    }

    /**
     * Remove ESC key listener
     */
    private removeEscapeListener() {
        document.removeEventListener('keydown', this.handleEscape)
    }

    /**
     * Static show method (convenience)
     */
    static show(component: Component, params: Record<string, any> = {}, config: PopupConfig = {}): PopupInstance {
        const popup = new PopupManager()
        return popup.open(component, params, config)
    }
}

// Export singleton instance
export const Popup = new PopupManager()

// Export class for static usage
export { PopupManager }
