export interface Shortcut {
  id: string;
  title: string;
  url: string;
  color?: string;
  icon?: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface WidgetConfig {
  id: string; // 'clock' | 'weather' | 'shortcuts' | 'todo' | 'ai-assistant' | 'sys-monitor'
  title: string;
  visible: boolean;
  size: 'sm' | 'md' | 'lg' | 'xl';
  order: number;
}

export interface ThemeConfig {
  theme: 'dark' | 'light' | 'amoled';
  glassBlur: number; // in px, e.g., 12, 16, 24
  glassOpacity: number; // percentage, e.g., 20, 40, 60
  accentColor: string; // HEX color
  backgroundType: 'gradient' | 'animated-mesh' | 'unsplash' | 'custom-url' | 'solid' | 'video' | 'local';
  backgroundValue: string; // gradient CSS class, unsplash keyword, image/video/local URL, or color code
  textColor: string;
  borderColor: string;
  glowEffect: boolean;
  userName: string;
  transitionSpeed?: 'slow' | 'normal' | 'fast';
  dynamicBlurEnabled?: boolean;
  magicAnimationEnabled?: boolean;
  magicAnimationType?: 'cosmic-stars' | 'sparkle-trail' | 'aurora' | 'interactive-trail';
}

export interface DashboardConfig {
  theme: ThemeConfig;
  widgets: WidgetConfig[];
  shortcuts: Shortcut[];
  todos: TodoItem[];
  syncCode: string | null;
  autoSync: boolean;
  lastSyncedAt: string | null;
}
