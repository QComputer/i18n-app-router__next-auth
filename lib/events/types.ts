/**
 * Event Types for the Event-Driven Architecture
 */

export enum UserEvents {
  USER_ROLE_CHANGED = "user:role_changed",
  USER_CREATED = "user:created",
  USER_DELETED = "user:deleted",
}

export interface UserRoleChangedEvent {
  type: UserEvents.USER_ROLE_CHANGED
  userId: string
  oldRole: string
  newRole: string
  timestamp: Date
}

export interface UserCreatedEvent {
  type: UserEvents.USER_CREATED
  userId: string
  role: string
  timestamp: Date
}

export interface UserDeletedEvent {
  type: UserEvents.USER_DELETED
  userId: string
  role: string
  timestamp: Date
}

export type UserEvent = UserRoleChangedEvent | UserCreatedEvent | UserDeletedEvent

// Re-export for convenience
export { UserEvents as default }
