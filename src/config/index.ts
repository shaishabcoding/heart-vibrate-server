/* eslint-disable no-useless-escape */
import './configure';
import env from '../util/env/env';
import type ms from 'ms';
import { genSecret } from '../util/crypto/genSecret';
import getIpAddress from '../util/server/getIpAddress';
import path from 'path';

const node_env = process.env.NODE_ENV ?? 'development';

const server_name =
  process.env.SERVER_NAME ??
  path.basename(process.cwd())?.toCapitalize() ??
  'Server';

const admin_email =
  process.env.ADMIN_EMAIL ?? `admin@${server_name.toLocaleLowerCase()}.com`;

const user_email =
  process.env.EMAIL_USER ?? `${server_name.toLocaleLowerCase()}@gmail.com`;

const support_email =
  process.env.EMAIL_SUPPORT ?? `support@${server_name.toLocaleLowerCase()}.com`;

/**
 * Configuration object for the application
 *
 * This object contains various configuration settings for the application,
 * including server details, database connection, allowed origins, and authentication settings.
 */
const config = {
  server: {
    node_env: env<string>('node env', node_env, {
      up: 'Server info - start',
      regex: '^(development|production)$',
    }),
    allowed_origins: env('allowed origins', ['*'], {
      regex: '^\*$|^(https?://[^,\s]+)(,https?://[^,\s]+)*',
    }),
    ip_address: env('ip address', getIpAddress(), {
      regex: '^(\d{1,3}\.){3}\d{1,3}$',
    }),
    port: env('port', Math.floor(Math.random() * 1_000) + 3_000, {
      regex: '^\d{4,5}$',
    }),
    developer: env('developer', 'Shaishab Chandra Shil', {
      regex: '^.{2,100}$',
      comment: "!Don't change this",
    }),
    name: env('server name', server_name, { regex: '^\w[\w\s-]{1,50}$' }),
    isDevelopment: node_env !== 'production',
    logo: env('logo', '/images/logo.svg', {
      regex: '^\/.*\.(png|jpg|jpeg|svg)$',
    }),
    default_avatar: env('default avatar', '/images/placeholder.png', {
      regex: '^\/.*\.(png|jpg|jpeg|svg)$',
    }),
    mock_mail: env('mock mail', true, {
      regex: '^(true|false)$',
      down: 'Server info - end',
    }),
  },

  url: {
    database: env(
      'database url',
      `mongodb://127.0.0.1:27017/${server_name.toLowerCase().replace(' ', '-')}`,
      { up: 'Database info - start', regex: '^mongodb:\/\/.*$' },
    ),
    api_doc: env('api doc', '', { regex: '^https?:\/\/.*$|^$' }),
    ui: env('ui url', '', {
      regex: '^https?:\/\/.*$|^$',
      down: 'Database info - end',
    }),
  },

  bcrypt_salt_rounds: env('bcrypt salt rounds', 10, {
    up: 'Authentication - start',
    regex: '^\d+$',
  }),

  otp: {
    length: env('otp length', 6, { regex: '^\d{1,2}$' }),
    exp: env<ms.StringValue>('otp expire in', '10m', { regex: '^\d+[smhd]$' }),
    limit: env('otp limit', 2, { regex: '^\d+$' }),
    window: env<ms.StringValue>('otp window', '10s', { regex: '^\d+[smhd]$' }),
  },

  jwt: {
    access_token: {
      secret: env('jwt access secret', genSecret(), { regex: '^.{10,}$' }),
      expire_in: env<ms.StringValue>('jwt access expire in', '1d', {
        regex: '^\d+[smhd]$',
      }),
    },
    refresh_token: {
      secret: env('jwt refresh secret', genSecret(), { regex: '^.{10,}$' }),
      expire_in: env<ms.StringValue>('jwt refresh expire in', '30d', {
        regex: '^\d+[smhd]$',
      }),
    },
    reset_token: {
      secret: env('jwt reset secret', genSecret(), { regex: '^.{10,}$' }),
      expire_in: env<ms.StringValue>('jwt reset expire in', '10m', {
        regex: '^\d+[smhd]$',
        down: 'Authentication - end',
      }),
    },
  },

  email: {
    user: env('email user', user_email, {
      up: 'Email credentials - start',
      regex: '^[\w.-]+@[\w.-]+\.\w+$',
    }),
    from: `${server_name} <${user_email}>`,
    port: env('email port', 587, { regex: '^\d{2,5}$' }),
    host: env('email host', 'smtp.gmail.com', {
      regex: '^[\w.-]+\.[a-z]{2,}$',
    }),
    pass: env('email pass', genSecret(4), { regex: '^.{4,}$' }),
    support: env('support email', support_email, {
      regex: '^[\w.-]+@[\w.-]+\.\w+$',
      down: 'Email credentials - end',
    }),
  },

  admin: {
    name: env('admin name', 'Mr. Admin', {
      up: 'Admin info - start',
      regex: '^.{2,100}$',
    }),
    email: env('admin email', admin_email, { regex: '^[\w.-]+@[\w.-]+\.\w+$' }),
    password: env('admin password', genSecret(4), {
      regex: '^.{6,32}$',
      down: 'Admin info - end',
    }),
  },
};

export default config;
