import type { XMessage } from './XMessage.mts';
import type { cmdCategories } from './CmdCategories.mts';

export interface Command {
  /** Name of function */
  name: string | RegExp;
  /** Should the command always run when it recieves a messgae */
  on?: string | undefined;
  /** Function of the command, must be async */
  function?: (message: XMessage, match?: string) => Promise<unknown>;
  /** Should the command be for only sudo and bot owner */
  fromMe?: boolean;
  /** Should the command only be for Groups */
  isGroup?: boolean;
  /** Description of what the command does */
  desc?: string | undefined;
  /** Category of where the command should below */
  type?: cmdCategories;
  /** Should the command appear on the menu list? */
  dontAddCommandList?: boolean;
}
