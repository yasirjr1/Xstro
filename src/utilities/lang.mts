import { getConfig } from '../index.mts';

const db = await getConfig();

export const lang = {
  isAdmin: '_This command can be used by Admins_',
  isBotAdmin: '_I cannot perform this action until I am an Admin_',
  groups_only: '_This command is for groups only!_',
  ban_msg: '_You have been banned from using bot commands._',
  disablecmd: '_This command has been disabled, use the enablecmd command to get it back on_',
  commands: {
    bio: {
      not_provided: '_Provide a new bio_',
      successfull: '_Bio updated!_',
    },
    waname: {
      not_provided: '_Provide a new name_',
      sucessfull: '_Updated whatsapp profile name_',
    },
    block: {
      not_provided: '_Provide someone to block!_',
      not_whatsapp_user: '_Not A WhatsApp User_',
      successfull: '_Blocked!_',
    },
    unblock: {
      not_provided: '_Provide someone to unblock!_',
      successfull: '_Unblocked!_',
    },
    pp: {
      no_image: '_Reply an Image_',
      failed: '_Failed to Process Image!_',
      successfull: '_Profile Picture Updated!_',
    },
    vv: {
      no_view_once: '_Reply a view-once message_',
      no_media: '_No supported media found_',
    },
    tovv: {
      no_media: '_Reply to an image, video, or audio message_',
    },
    edit: {
      not_from_me: '_Reply a message from you._',
      no_text: `_Usage: ${db.prefix[0]}edit hello there_`,
      successfull: null,
    },
    dlt: {
      no_quoted: '_Reply a message._',
      successfull: null,
    },
    blocklist: {
      no_blocked: '_No blocked numbers found!_',
    },
    save: {
      no_status: '_Reply a status_',
      successfull: '_Status saved!_',
    },
  },
};
