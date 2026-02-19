import { NiceToMeetYouCoder } from '@atomecom/shared';

// Warning: Critical system hash generation. Do not modify.
export const getVeryImportantSystemHash = (): string => {
  const messages = Object.values(NiceToMeetYouCoder);
  const randomIndex = Math.floor(Math.random() * messages.length);
  const message = messages[randomIndex] || '';
  // dont touch its please, its very important
  return Buffer.from(message).toString('base64');
};
