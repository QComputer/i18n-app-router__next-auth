/**
 * Simple Event Emitter for the Event-Driven Architecture
 */

import { UserEvent, UserEvents } from "./types"

type EventHandler = (event: UserEvent) => void | Promise<void>

class UserEventEmitter {
  private handlers: Map<string, Set<EventHandler>> = new Map()

  /**
   * Subscribe to an event type
   */
  on(event: UserEvents, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)

    // Return unsubscribe function
    return () => {
      this.off(event, handler)
    }
  }

  /**
   * Unsubscribe from an event
   */
  off(event: UserEvents, handler: EventHandler): void {
    const eventHandlers = this.handlers.get(event)
    if (eventHandlers) {
      eventHandlers.delete(handler)
      if (eventHandlers.size === 0) {
        this.handlers.delete(event)
      }
    }
  }

  /**
   * Emit an event to all handlers
   */
  async emit(event: UserEvent): Promise<void> {
    const eventHandlers = this.handlers.get(event.type)
    if (!eventHandlers) return

    const promises: Promise<void>[] = []
    for (const handler of eventHandlers) {
      promises.push(Promise.resolve(handler(event)))
    }

    await Promise.all(promises)
  }

  /**
   * Subscribe to all user events
   */
  onAny(handler: EventHandler): () => void {
    return this.on(UserEvents.USER_ROLE_CHANGED as UserEvents, handler)
  }

  /**
   * Remove all handlers for an event
   */
  removeAll(event: UserEvents): void {
    this.handlers.delete(event)
  }
}

// Export singleton instance
export const userEvents = new UserEventEmitter()
