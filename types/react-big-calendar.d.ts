import { CalendarProps } from 'react-big-calendar';

declare module 'react-big-calendar' {
  interface CalendarProps<TEvent extends object = any, TResource extends object = any> {
    onEventDrop?: (args: { event: TEvent; start: Date; end: Date }) => void;
    onEventResize?: (args: { event: TEvent; start: Date; end: Date }) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    draggable?: boolean;
    resizable?: boolean;
  }
} 