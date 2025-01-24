import config from '../../../config';
import { TUser } from '../user/User.interface';

export const adminData: Partial<TUser> = {
  name: {
    firstName: 'Shaishab',
    lastName: 'Chandra Shil',
  },
  gender: 'male',
  email: config.admin_email,
  password: config.admin_pass,
  role: 'ADMIN',
  avatar: 'https://avatars.githubusercontent.com/u/109936547?v=4',
};

export const makeResetBody = (resetToken: string) => `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            margin: 0 auto;
            width: 80%;
            max-width: 600px;
            margin: auto;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background-color: #f9f9f9;
          }
          .header {
            text-align: center;
            background-color: #4CAF50;
            color: #fff;
            padding: 15px;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
          }
          .content {
            padding: 20px;
            line-height: 1.6;
            text-align: center;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            font-size: 16px;
            font-weight: bold;
            color: #fff;
            background-color: #4CAF50;
            border: none;
            border-radius: 5px;
            text-decoration: none;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Password Reset</h2>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password. Please click the button below to reset it:</p>
            <a href="${
              config.reset_pass_ui_link
            }?token=${resetToken}" class="button">Reset Password</a>
            <p>If you did not request a password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>Thank you for using our service.</p>
            <p>&copy; ${new Date().getFullYear()} Shaishab coding</p>
          </div>
        </div>
      </body>
    </html>
  `;
