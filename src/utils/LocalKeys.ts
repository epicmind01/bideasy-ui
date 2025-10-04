// Local storage keys used throughout the application

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  THEME: 'theme_preference',
  LANGUAGE: 'language_preference',
  SIDEBAR_STATE: 'sidebar_state',
  FILTERS: 'saved_filters',
  RECENT_SEARCHES: 'recent_searches',
  NOTIFICATIONS: 'notification_settings',
  DASHBOARD_LAYOUT: 'dashboard_layout',
  TABLE_PREFERENCES: 'table_preferences',
} as const;

export type LocalStorageKey = typeof LOCAL_STORAGE_KEYS[keyof typeof LOCAL_STORAGE_KEYS];
