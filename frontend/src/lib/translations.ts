// Translation keys and strings for the application
export const translations = {
  en: {
    // General
    'app.title': 'Pudding mit Gabel',
    'app.subtitle': 'Find your pudding people around the world',
    
    // Navigation
    'create.event': 'Create Event',
    'login': 'Login',
    
    // Location
    'use.location': 'Use My Location',
    'radius.km': 'km',
  },
  
  de: {
    // General
    'app.title': 'Pudding mit Gabel',
    'app.subtitle': 'Finde deine Pudding-Leute auf der ganzen Welt',
    
    // Navigation
    'create.event': 'Event erstellen',
    'login': 'Anmelden',
    
    // Location
    'use.location': 'Meinen Standort verwenden',
    'radius.km': 'km',
  },
} as const;

// Extract all translation keys for type safety
export type TranslationKey = keyof typeof translations.en;

// Supported languages
export type Language = keyof typeof translations;

