import fs from 'fs';

export const appendDataToFile = async (
  file: string,
  content: string,
  flags = 'a',
): Promise<void> => {
  // use {flags: 'a'} to append and {flags: 'w'} to erase and write a new file
  return new Promise<void>(resolve => {
    const fileStream = fs.createWriteStream(file, { flags });
    fileStream.write(content);
    fileStream.end();
    fileStream.on('finish', resolve);
  });
};
