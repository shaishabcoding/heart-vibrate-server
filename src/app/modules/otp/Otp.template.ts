import ms from 'ms';
import config from '../../../config';

export const OtpTemplates = {
  'reset password': ({
    userName,
    otp,
  }: {
    userName: string;
    otp: string;
  }) => /*html*/ `
  	<!DOCTYPE html>
		<html lang="en">
  		<head>
  			<meta charset="UTF-8" />
  			<meta
  				name="viewport"
  				content="width=device-width, initial-scale=1.0"
  			/>
  			<title>${config.server.name} - Password Reset Verification</title>
			<style>
				* {
				  margin: 0;
				  padding: 0;
				  box-sizing: border-box;
				}

				body {
				  font-family: Arial, sans-serif;
				  background-color: #fafafa;
				  -webkit-font-smoothing: antialiased;
				  line-height: 1.4;
				}

				/* Container styles */
				.container {
				  max-width: 600px;
				  margin: 0 auto;
				  padding: 20px;
				}

				/* Card styles */
				.card {
				  background: #ffffff;
				  border-radius: 16px;
				  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
				  overflow: hidden;
				}

				/* Header styles */
				.header {
				  background: linear-gradient(135deg, #4f46e5, #7c3aed);
				  padding: 32px;
				  text-align: center;
				  color: white;
				  position: relative;
				}

				.header h1 {
				  font-size: 28px;
				  margin: 16px 0 8px;
				}

				.header p {
				  font-size: 18px;
				  opacity: 0.9;
				}

				/* Content styles */
				.content {
				  padding: 32px;
				}

				.greeting {
				  text-align: center;
				  margin-bottom: 32px;
				}

				.greeting h2 {
				  font-size: 24px;
				  color: #1f2937;
				  margin-bottom: 8px;
				}

				.greeting p {
				  color: #4b5563;
				}

				/* OTP display styles */
				.otp-container {
				  background: linear-gradient(
				    to right,
				    rgba(79, 70, 229, 0.1),
				    rgba(124, 58, 237, 0.1)
				  );
				  border-radius: 12px;
				  padding: 24px;
				  margin-bottom: 32px;
				  text-align: center;
				}

				.otp-numbers {
				  display: inline-block;
				  font-size: 0;
				}

				.otp-number {
				  display: inline-block;
				  width: 60px;
				  height: 60px;
				  background: white;
				  border-radius: 8px;
				  margin: 0 4px;
				  font-size: 32px;
				  font-weight: bold;
				  line-height: 60px;
				  text-align: center;
				  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
				  font-family: monospace;
				}

				/* Info cards styles */
				.info-card {
				  padding: 20px;
				  margin-bottom: 16px;
				  border-radius: 12px;
				  display: table;
				  width: 100%;
				}

				.info-card.time {
				  background-color: #eff6ff;
				  border: 1px solid #dbeafe;
				}

				.info-card.security {
				  background-color: #fff7ed;
				  border: 1px solid #fed7aa;
				}

				.info-card.welcome {
				  background-color: #f0fdf4;
				  border: 1px solid #bbf7d0;
				}

				.info-card.role {
				  background-color: #fef3c7;
				  border: 1px solid #fde68a;
				}

				.info-icon {
				  display: table-cell;
				  vertical-align: top;
				  width: 40px;
				}

				.info-content {
				  display: table-cell;
				  vertical-align: top;
				  padding-left: 16px;
				}

				.info-content h3 {
				  font-size: 16px;
				  margin-bottom: 4px;
				}

				/* Footer styles */
				.footer {
				  border-top: 1px solid #f3f4f6;
				  padding: 24px;
				  text-align: center;
				  background-color: #f9fafb;
				}

				.footer p {
				  color: #6b7280;
				  font-size: 14px;
				  margin: 4px 0;
				}

				/* Icon placeholders */
				.icon {
				  width: 24px;
				  height: 24px;
				  background-color: currentColor;
				  display: inline-block;
				  border-radius: 50%;
				}

				.icon.time {
				  color: #3b82f6;
				}
				.icon.shield {
				  color: #f59e0b;
				}
				.icon.support {
				  color: #6b7280;
				}
				.icon.welcome {
				  color: #10b981;
				}
				.icon.role {
				  color: #f59e0b;
				}
				.logo {
				  height: 50px;
				}

				/* CTA Button */
				.cta-button {
				  display: inline-block;
				  background: linear-gradient(135deg, #4f46e5, #7c3aed);
				  color: white;
				  padding: 12px 32px;
				  border-radius: 8px;
				  text-decoration: none;
				  font-weight: bold;
				  margin: 16px 0;
				  transition: transform 0.2s;
				}

				.cta-button:hover {
				  transform: translateY(-2px);
				}
			</style>
  		</head>
  		<body>
  			<div class="container">
  				<div class="card">
  					<div class="header">
  						<h1>Password Reset</h1>
  						<p>Verification Required</p>
  					</div>

  					<div class="content">
  						<div class="greeting">
  							<h2>Hi, ${userName}</h2>
  							<p>
  								We received a request to reset your password. Enter
  								this verification code to continue:
  							</p>
  						</div>

  						<div class="otp-container">
  							<div class="otp-numbers">
  								${otp
                    .split('')
                    .map(
                      (number: string) =>
                        `<span class="otp-number">${number}</span>`,
                    )}
  							</div>
  						</div>

  						<div class="info-card time">
  							<div class="info-icon">
  								<span class="icon time"></span>
  							</div>
  							<div class="info-content">
  								<h3>Time Sensitive</h3>
  								<p>
  									This code will expire in ${ms(ms(config.otp.exp), { long: true })} for security
  								</p>
  							</div>
  						</div>

  						<div class="info-card security">
  							<div class="info-icon">
  								<span class="icon shield"></span>
  							</div>
  							<div class="info-content">
  								<h3>Security Notice</h3>
  								<p>
  									Never share this code with anyone. Our team will
  									never ask for your verification code.
  								</p>
  							</div>
  						</div>
  					</div>

  					<div class="footer">
  						<p>
  							© ${new Date().getFullYear()} ${config.server.name}. All
  							rights reserved.
  						</p>
  						<p>This is an automated message, please do not reply</p>
  					</div>
  				</div>
  			</div>
  		</body>
  	</html>
	`,

  'account verify': ({
    userName,
    otp,
  }: {
    userName: string;
    otp: string;
  }) => /*html*/ `
  	<!DOCTYPE html>
		<html lang="en">
  		<head>
  			<meta charset="UTF-8" />
  			<meta
  				name="viewport"
  				content="width=device-width, initial-scale=1.0"
  			/>
  			<title>Welcome to ${config.server.name} - Verify Your Account</title>
			<style>
				* {
				  margin: 0;
				  padding: 0;
				  box-sizing: border-box;
				}

				body {
				  font-family: Arial, sans-serif;
				  background-color: #fafafa;
				  -webkit-font-smoothing: antialiased;
				  line-height: 1.4;
				}

				/* Container styles */
				.container {
				  max-width: 600px;
				  margin: 0 auto;
				  padding: 20px;
				}

				/* Card styles */
				.card {
				  background: #ffffff;
				  border-radius: 16px;
				  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
				  overflow: hidden;
				}

				/* Header styles */
				.header {
				  background: linear-gradient(135deg, #10b981, #059669);
				  padding: 32px;
				  text-align: center;
				  color: white;
				  position: relative;
				}

				.header h1 {
				  font-size: 28px;
				  margin: 16px 0 8px;
				}

				.header p {
				  font-size: 18px;
				  opacity: 0.9;
				}

				/* Content styles */
				.content {
				  padding: 32px;
				}

				.greeting {
				  text-align: center;
				  margin-bottom: 32px;
				}

				.greeting h2 {
				  font-size: 24px;
				  color: #1f2937;
				  margin-bottom: 8px;
				}

				.greeting p {
				  color: #4b5563;
				  margin-bottom: 8px;
				}

				/* OTP display styles */
				.otp-container {
				  background: linear-gradient(
				    to right,
				    rgba(16, 185, 129, 0.1),
				    rgba(5, 150, 105, 0.1)
				  );
				  border-radius: 12px;
				  padding: 24px;
				  margin-bottom: 32px;
				  text-align: center;
				}

				.otp-numbers {
				  display: inline-block;
				  font-size: 0;
				}

				.otp-number {
				  display: inline-block;
				  width: 60px;
				  height: 60px;
				  background: white;
				  border-radius: 8px;
				  margin: 0 4px;
				  font-size: 32px;
				  font-weight: bold;
				  line-height: 60px;
				  text-align: center;
				  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
				  font-family: monospace;
				}

				/* Info cards styles */
				.info-card {
				  padding: 20px;
				  margin-bottom: 16px;
				  border-radius: 12px;
				  display: table;
				  width: 100%;
				}

				.info-card.time {
				  background-color: #eff6ff;
				  border: 1px solid #dbeafe;
				}

				.info-card.welcome {
				  background-color: #f0fdf4;
				  border: 1px solid #bbf7d0;
				}

				.info-card.role {
				  background-color: #fef3c7;
				  border: 1px solid #fde68a;
				}

				.info-icon {
				  display: table-cell;
				  vertical-align: top;
				  width: 40px;
				}

				.info-content {
				  display: table-cell;
				  vertical-align: top;
				  padding-left: 16px;
				}

				.info-content h3 {
				  font-size: 16px;
				  margin-bottom: 4px;
				}

				/* Footer styles */
				.footer {
				  border-top: 1px solid #f3f4f6;
				  padding: 24px;
				  text-align: center;
				  background-color: #f9fafb;
				}

				.footer p {
				  color: #6b7280;
				  font-size: 14px;
				  margin: 4px 0;
				}

				/* Icon placeholders */
				.icon {
				  width: 24px;
				  height: 24px;
				  background-color: currentColor;
				  display: inline-block;
				  border-radius: 50%;
				}

				.icon.time {
				  color: #3b82f6;
				}
				.icon.welcome {
				  color: #10b981;
				}
				.icon.role {
				  color: #f59e0b;
				}
				.logo {
				  height: 50px;
				}

				/* CTA Button */
				.cta-button {
				  display: inline-block;
				  background: linear-gradient(135deg, #10b981, #059669);
				  color: white;
				  padding: 12px 32px;
				  border-radius: 8px;
				  text-decoration: none;
				  font-weight: bold;
				  margin: 16px 0;
				  transition: transform 0.2s;
				}

				.cta-button:hover {
				  transform: translateY(-2px);
				}
			</style>
  		</head>
  		<body>
  			<div class="container">
  				<div class="card">
  					<div class="header">
  						<h1>Welcome to ${config.server.name}!</h1>
  						<p>Let's verify your account</p>
  					</div>

  					<div class="content">
  						<div class="greeting">
  							<h2>Hi, ${userName}!</h2>
  							<p>
  								Thank you for joining ${config.server.name}! We're excited to have you on board.
  							</p>
  							<p>
  								To complete your registration and start using your account, 
  								please verify your email with the code below:
  							</p>
  						</div>

  						<div class="otp-container">
  							<div class="otp-numbers">
  								${otp
                    .split('')
                    .map(
                      (number: string) =>
                        `<span class="otp-number">${number}</span>`,
                    )}
  							</div>
  						</div>

  						<div class="info-card welcome">
  							<div class="info-icon">
  								<span class="icon welcome"></span>
  							</div>
  							<div class="info-content">
  								<h3>Welcome Aboard!</h3>
  								<p>
  									You're now part of our community. Once verified, you'll have access to all features.
  								</p>
  							</div>
  						</div>

  						<div class="info-card role">
  							<div class="info-icon">
  								<span class="icon role"></span>
  							</div>
  							<div class="info-content">
  								<h3>Your Account Status</h3>
  								<p>
  									Your account has been created with <strong>GUEST</strong> role. 
  									You can upgrade your permissions by contacting our support team.
  								</p>
  							</div>
  						</div>

  						<div class="info-card time">
  							<div class="info-icon">
  								<span class="icon time"></span>
  							</div>
  							<div class="info-content">
  								<h3>Time Sensitive</h3>
  								<p>
  									This verification code will expire in ${ms(ms(config.otp.exp), { long: true })} for security reasons.
  								</p>
  							</div>
  						</div>

  						<div style="text-align: center; margin-top: 24px;">
  							<a href="${config.url.ui}/auth/otp/verify/account" class="cta-button">
  								Verify My Account
  							</a>
  						</div>
  					</div>

  					<div class="footer">
  						<p>
  							© ${new Date().getFullYear()} ${config.server.name}. All
  							rights reserved.
  						</p>
  						<p>
  							Need help? Contact us at <a href="mailto:${config.email.support}">${config.email.support}</a>
  						</p>
  						<p>This is an automated message, please do not reply</p>
  					</div>
  				</div>
  			</div>
  		</body>
  	</html>
	`,
};
