declare module "@vimeo/player" {
  interface PlayerOptions {
    id?: number;
    url?: string;
    width?: number;
    height?: number;
    autopause?: boolean;
    autoplay?: boolean;
    background?: boolean;
    byline?: boolean;
    color?: string;
    controls?: boolean;
    dnt?: boolean;
    loop?: boolean;
    muted?: boolean;
    pip?: boolean;
    playsinline?: boolean;
    portrait?: boolean;
    quality?: string;
    responsive?: boolean;
    speed?: boolean;
    title?: boolean;
    transparent?: boolean;
  }

  interface TimeUpdateData {
    duration: number;
    percent: number;
    seconds: number;
  }

  interface PlayData {
    duration: number;
    percent: number;
    seconds: number;
  }

  interface ErrorData {
    message: string;
    method: string;
    name: string;
  }

  export default class Player {
    constructor(element: HTMLElement | string, options?: PlayerOptions);

    on(event: "play", callback: (data: PlayData) => void): void;
    on(event: "pause", callback: (data: PlayData) => void): void;
    on(event: "ended", callback: (data: PlayData) => void): void;
    on(event: "timeupdate", callback: (data: TimeUpdateData) => void): void;
    on(event: "progress", callback: (data: TimeUpdateData) => void): void;
    on(event: "loaded", callback: (data: { id: number }) => void): void;
    on(event: "error", callback: (data: ErrorData) => void): void;
    on(event: string, callback: (data: any) => void): void;

    off(event: string, callback?: (data: any) => void): void;

    play(): Promise<void>;
    pause(): Promise<void>;
    destroy(): Promise<void>;

    getCurrentTime(): Promise<number>;
    setCurrentTime(seconds: number): Promise<number>;
    getDuration(): Promise<number>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<number>;
    getPaused(): Promise<boolean>;
    getEnded(): Promise<boolean>;
  }
}
