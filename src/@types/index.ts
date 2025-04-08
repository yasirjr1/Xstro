import type { WAContextInfo, WAMessage, WAMessageContent } from 'baileys';
import type { FileTypeResult } from 'file-type';
import type { serialize } from '../core/serialize';

/**
 * Commands interface for defining command handlers
 * @interface Commands
 */
export interface Commands {
  /**
   * Name of function as string or RegExp pattern
   * @type {string | RegExp}
   */
  name?: string | RegExp;

  /**
   * Event name to trigger command execution on message reception
   * @type {string}
   */
  on?: string;

  /**
   * Function of the command, must be async
   * @param {Serialize} message - Serialized message object
   * @param {string} [match] - Optional matched string from RegExp pattern
   * @returns {Promise<unknown>}
   */
  function: (message: Serialize, match?: string) => Promise<unknown>;

  /**
   * Whether the command is restricted to sudo and bot owner
   * @type {boolean}
   */
  fromMe: boolean;

  /**
   * Whether the command should only be used in group chats
   * @type {boolean}
   */
  isGroup: boolean;

  /**
   * Description of what the command does
   * @type {string}
   */
  desc?: string;

  /**
   * Category where the command belongs
   * @type {'ai' | 'misc' | 'system' | 'settings' | 'tools' | 'whatsapp' | 'group' | 'news' | 'chats' | 'download' | 'media' | 'utilities' | 'user' | 'privacy' | 'games'}
   */
  type:
    | 'ai'
    | 'misc'
    | 'system'
    | 'settings'
    | 'tools'
    | 'whatsapp'
    | 'group'
    | 'news'
    | 'chats'
    | 'download'
    | 'media'
    | 'utilities'
    | 'user'
    | 'privacy'
    | 'games';

  /**
   * Whether to exclude command from menu list
   * @type {boolean}
   */
  dontAddCommandList?: boolean;
}

/**
 * Serialized message type extracted from the return type of serialize function
 * @type {ReturnType<typeof serialize> extends Promise<infer T> ? T : undefined}
 */
export type Serialize = ReturnType<typeof serialize> extends Promise<infer T> ? T : undefined;

/**
 * Message miscellaneous options
 * @interface MessageMisc
 */
export type MessageMisc = {
  /**
   * JID to send to (specific number), uses auto-detection if not provided
   * @type {string}
   */
  jid?: string;

  /**
   * MIME type of the content
   * @type {string}
   */
  mimetype?: string;

  /**
   * Content type selector
   * @type {'text' | 'audio' | 'image' | 'video' | 'sticker' | 'document'}
   */
  type?: 'text' | 'audio' | 'image' | 'video' | 'sticker' | 'document';

  /**
   * Message to quote/reply to
   * @type {WAMessage}
   */
  quoted?: WAMessage;
};

/**
 * Result of content type detection
 * @type {FileTypeResult | { isPath: true; path: string } | string | undefined}
 */
export type ContentTypeResult =
  | FileTypeResult
  | { isPath: true; path: string }
  | string
  | undefined;

/**
 * Logging levels
 * @type {'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'}
 */
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

/**
 * Logger interface
 * @interface ILogger
 */
export interface ILogger {
  /**
   * Current log level
   * @type {string}
   */
  level: string;

  /**
   * Creates child logger with additional context
   * @param {Record<string, unknown>} obj - Context object
   * @returns {ILogger} Child logger instance
   */
  child(obj: Record<string, unknown>): ILogger;

  /**
   * Log trace message
   * @param {unknown} obj - Object to log
   * @param {unknown} [msg] - Optional message
   */
  trace(obj: unknown, msg?: unknown): void;

  /**
   * Log debug message
   * @param {unknown} obj - Object to log
   * @param {unknown} [msg] - Optional message
   */
  debug(obj: unknown, msg?: unknown): void;

  /**
   * Log info message
   * @param {unknown} obj - Object to log
   * @param {unknown} [msg] - Optional message
   */
  info(obj: unknown, msg?: unknown): void;

  /**
   * Log warning message
   * @param {unknown} obj - Object to log
   * @param {unknown} [msg] - Optional message
   */
  warn(obj: unknown, msg?: unknown): void;

  /**
   * Log error message
   * @param {unknown} obj - Object to log
   * @param {unknown} [msg] - Optional message
   */
  error(obj: unknown, msg?: unknown): void;
}

/**
 * Additional details for error objects
 * @interface ErrorDetails
 */
export interface ErrorDetails {
  /**
   * Any additional custom properties
   */
  [key: string]: any;

  /**
   * Context information about the error
   * @type {Record<string, any>}
   */
  context?: Record<string, any>;

  /**
   * Error timestamp
   * @type {string}
   */
  timestamp?: string;

  /**
   * Correlation ID for tracing errors
   * @type {string}
   */
  correlationId?: string;
}

/**
 * Options for configuring error objects
 * @interface ErrorOptions
 */
export interface ErrorOptions {
  /**
   * Error code identifier
   * @type {string}
   */
  code?: string;

  /**
   * HTTP status code
   * @type {number}
   */
  httpCode?: number;

  /**
   * Additional error details
   * @type {ErrorDetails}
   */
  details?: ErrorDetails;

  /**
   * Original error that caused this error
   * @type {Error | unknown}
   */
  cause?: Error | unknown;

  /**
   * Error severity level
   * @type {'low' | 'medium' | 'high' | 'critical'}
   */
  severity?: 'low' | 'medium' | 'high' | 'critical';

  /**
   * Whether error is operational (expected) vs programmer error
   * @type {boolean}
   */
  isOperational?: boolean;
}

/**
 * Base options for message sending
 * @interface BaseOptions
 */
type BaseOptions = {
  /**
   * Content of the message
   * @type {unknown}
   */
  content: unknown;

  /**
   * Additional options for sending messages
   */
  sendOptions?: {
    /**
     * Relay message options
     */
    relayMessage?: {
      /**
       * Message content to relay
       * @type {WAMessageContent}
       */
      message: WAMessageContent;
    };

    /**
     * Whether to forward the message
     * @type {boolean}
     */
    forward?: boolean;

    /**
     * Options for forwarding complete messages
     */
    forwardFullMessage?: {
      /**
       * Whether to include forward tag
       * @type {boolean}
       */
      forwardTag?: boolean;

      /**
       * Message to forward
       * @type {WAMessage | WAMessageContent}
       */
      Message: WAMessage | WAMessageContent;
    };

    /**
     * Additional context information for the message
     * @type {WAContextInfo}
     */
    contextInfo?: WAContextInfo;
  };
};

/**
 * Media types for message content
 * @interface MediaType
 */
export type MediaType = {
  /**
   * Text content
   * @type {string}
   */
  text?: string;

  /**
   * Audio content (path or buffer)
   * @type {string | Buffer}
   */
  audio?: string | Buffer;

  /**
   * Image content (path or buffer)
   * @type {string | Buffer}
   */
  image?: string | Buffer;

  /**
   * Video content (path or buffer)
   * @type {string | Buffer}
   */
  video?: string | Buffer;

  /**
   * Sticker content (path or buffer)
   * @type {string | Buffer}
   */
  sticker?: string | Buffer;

  /**
   * Document content (path or buffer)
   * @type {string | Buffer}
   */
  document?: string | Buffer;
};

/**
 * Options for sending different types of messages
 * Combines base options with media type options using mapped types
 * @type {sendMessageOptions}
 */
export type sendMessageOptions = BaseOptions & {
  [K in keyof MediaType]: MediaType[K];
} & {
    [K in keyof MediaType as Exclude<keyof MediaType, K>]?: unknown;
  }[keyof MediaType];

/**
 * Map of available settings with their types
 * @interface SettingsMap
 */
export interface SettingsMap {
  /**
   * Command prefixes
   * @type {string[]}
   */
  prefix: string[];

  /**
   * Bot operation mode
   * @type {boolean}
   */
  mode: boolean;
}

/**
 * Partial settings for updates
 * @interface Settings
 */
export type Settings = {
  /**
   * Command prefixes
   * @type {string[]}
   */
  prefix?: string[];

  /**
   * Bot operation mode
   * @type {boolean}
   */
  mode?: boolean;
};

export interface AppConfig {
  SESSION: string;
  SESSION_DIR: string;
  DATABASE: string;
  PROXY_URI: string;
  DEV_MODE: boolean;
  LOGGER: string;
  PROCESS_NAME: string;
}
