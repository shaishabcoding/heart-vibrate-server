import ms from 'ms';
import config from '../../../config';
import { sendEmail } from '../../../util/sendMail';
import { OtpTemplates } from './Otp.template';
import { otpGenerator } from '../../../util/crypto/otpGenerator';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { User as TUser } from '../../../../prisma';
import prisma from '../../../util/prisma';

export const OtpServices = {
  async send(user: TUser, template: keyof typeof OtpTemplates) {
    const otp = otpGenerator(config.otp.length);

    sendEmail({
      to: user.email,
      subject: `Your ${config.server.name} ${template} OTP is ⚡ ${otp} ⚡.`,
      html: OtpTemplates[template]({
        userName: user?.name ?? 'Mr. ' + user.role,
        otp,
      }),
    });

    return prisma.otp.upsert({
      where: { userId: user.id },
      update: { code: otp, exp: new Date(Date.now() + ms(config.otp.exp)) },
      create: {
        userId: user.id,
        code: otp,
        exp: new Date(Date.now() + ms(config.otp.exp)),
      },
    });
  },

  async verify(userId: string, code: string) {
    /** Delete expired otp */
    await prisma.otp.deleteMany({
      where: { exp: { lt: new Date() } },
    });

    const validOtp = await prisma.otp.findFirst({
      where: { userId, code, exp: { gt: new Date() } },
    });

    if (!validOtp)
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'Invalid OTP. Please request a new one.',
      );

    return prisma.otp.delete({ where: { id: validOtp.id } });
  },
};
