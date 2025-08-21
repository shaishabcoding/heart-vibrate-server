/* eslint-disable no-console */
import fs from 'fs';
import { envPath } from '../../config/configure';
import colors from 'colors';

/**
 * Retrieves an environment variable with type checking, error handling, and appending to .env if not found
 *
 * @param key - The key of the environment variable to retrieve
 * @param defaultValue - The default value to return if the environment variable is not found
 * @returns The value of the environment variable or the default value
 */
export default function env<T>(
  key: string,
  defaultValue?: T,
  options: {
    up?: string;
    down?: string;
    regex?: string;
    comment?: string;
  } = {},
): T {
  options.regex ??= Array.isArray(defaultValue)
    ? '^([a-zA-Z0-9]+,?)+$'
    : typeof defaultValue === 'string'
      ? '^[a-zA-Z0-9]+$'
      : typeof defaultValue === 'number'
        ? '^\\d+$'
        : typeof defaultValue === 'boolean'
          ? '^true|false$'
          : '';

  key = key.toSnakeCase().toUpperCase();
  let value: any = process.env[key];

  if (value === undefined) {
    console.log(
      colors.yellow(
        `⚠️ Environment variable ${key} is not set, setting to ${defaultValue}`,
      ),
    );

    if (defaultValue === undefined)
      console.error(colors.red(`❌ Environment variable ${key} is required`));

    if (fs.existsSync(envPath)) {
      const envData = fs.readFileSync(envPath, 'utf8');

      const keyRegex = new RegExp(`^${key} =`, 'm');

      if (!keyRegex.test(envData))
        fs.appendFileSync(
          envPath,
          `${options?.up ? `#${options?.up} \n` : ''}${key} = "${defaultValue}" ${options?.regex ? `# ${options?.comment ? `${options?.comment} --> ` : ''}type: ${getType(defaultValue)}, regex: (/${options?.regex}/)\n` : ''}${options?.down ? `#${options?.down} \n\n\n` : ''}`,
          'utf8',
        );
    } else
      fs.writeFileSync(
        envPath,
        `${options?.up ? `#${options?.up} \n` : ''}${key} = "${defaultValue}" ${options?.regex ? `# ${options?.comment ? `${options?.comment} --> ` : ''}type: ${getType(defaultValue)}, regex: (/${options?.regex}/)\n` : ''}${options?.down ? `#${options?.down} \n\n\n` : ''}`,
        'utf8',
      );

    console.log(
      colors.green(`✅ Environment variable ${key} set to ${defaultValue}`),
    );

    if (Array.isArray(defaultValue)) value = defaultValue.join(',');
    else value = defaultValue;
  }

  if (typeof defaultValue === 'boolean')
    return (value!.toLowerCase() === 'true') as T;

  if (typeof defaultValue === 'number') {
    const num = Number(value);
    if (isNaN(num))
      throw new Error(`Environment variable ${key} is not a valid number`);

    return num as T;
  }

  if (Array.isArray(defaultValue))
    return value!.split(',').map((item: string) => item.trim()) as T;

  return (value ?? defaultValue) as T;
}

function getType(value: any) {
  if (Array.isArray(value)) return 'array';
  else if (typeof value === 'string') return 'string';
  else if (typeof value === 'number') return 'number';
  else if (typeof value === 'boolean') return 'boolean';
  else return 'unknown';
}
