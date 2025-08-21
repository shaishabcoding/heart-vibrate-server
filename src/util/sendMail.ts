import nodemailer from 'nodemailer';
import config from '../config';
import { errorLogger, logger } from './logger/logger';
import { StatusCodes } from 'http-status-codes';
import ServerError from '../errors/ServerError';
import colors from 'colors';
const { host, port, user, pass, from } = config.email;
const { mock_mail } = config.server;

let transporter = nodemailer.createTransport({
  host,
  port,
  secure: false,
  auth: {
    user,
    pass,
  },
});

if (mock_mail) {
  logger.info(colors.yellow('Mock mail enabled'));
  transporter = {
    sendMail: ({ to = 'mock_mail' }) => {
      logger.info(colors.green('Mock mail sent'));
      return {
        accepted: [to],
      };
    },
    verify: () => true,
  } as any;
}

export const verifyEmailTransporter = async () => {
  try {
    return await transporter.verify();
  } catch (error: any) {
    throw new Error(
      'Email credentials verification failed. Check your .env configuration: ' +
        error.message,
    );
  }
};

/**
 * Send email
 * @param {TEmailProps} values - Email values
 * @returns void
 */
export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  logger.info(colors.yellow('Sending email...'), to);
  try {
    const { accepted } = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    if (!accepted.length)
      throw new ServerError(StatusCodes.SERVICE_UNAVAILABLE, 'Mail not sent');

    logger.info(colors.green(`✔ Mail send successfully. On: ${accepted[0]}`));
  } catch (error: any) {
    errorLogger.error(colors.red('❌ Email send failed'), error.message);
    throw new ServerError(StatusCodes.SERVICE_UNAVAILABLE, error.message);
  }
};
