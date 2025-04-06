import database from '../core/database';
import type { SettingsMap } from '../@types';

export const configDB = database.define('config', {
  prefix: { type: 'STRING', allowNull: false, defaultValue: '.' },
  mode: { type: 'INTEGER', allowNull: false, defaultValue: 1 },
});

export async function getSettings(): Promise<SettingsMap> {
  const msg = (await configDB.findAll()) as SettingsMap[];
  const config = JSON.parse(JSON.stringify(msg));
  const mappedSettings = config.map((setting: SettingsMap) => ({
    prefix: Array.isArray(setting.prefix) ? setting.prefix : Array.from(setting.prefix),
    mode: Boolean(setting.mode),
  }));
  return mappedSettings[0] as SettingsMap;
}
