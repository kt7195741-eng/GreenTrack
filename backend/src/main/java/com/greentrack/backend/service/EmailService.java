package com.greentrack.backend.service;

import com.greentrack.backend.constants.EmailConstants;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send signup/registration email - sent ONLY when user signs up
     */
    public void sendSignupEmail(String toEmail, String userName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(EmailConstants.SENDER_EMAIL);
            message.setTo(toEmail);
            message.setSubject(EmailConstants.SIGNUP_EMAIL_SUBJECT);

            // Replace placeholder with actual user name
            String body = EmailConstants.replacePlaceholder(
                    EmailConstants.SIGNUP_EMAIL_BODY,
                    "USER_NAME",
                    userName);
            message.setText(body);

            mailSender.send(message);
            logger.info("Signup email sent to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send signup email to " + toEmail, e);
            // Don't throw exception — let signup succeed even if email fails
        }
    }

    /**
     * Send verification code for password reset
     */
    public void sendVerificationCode(String toEmail, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(EmailConstants.SENDER_EMAIL);
            message.setTo(toEmail);
            message.setSubject(EmailConstants.PASSWORD_RESET_SUBJECT);

            // Replace placeholder with actual reset code
            String body = EmailConstants.replacePlaceholder(
                    EmailConstants.PASSWORD_RESET_BODY,
                    "RESET_CODE",
                    code);
            message.setText(body);

            mailSender.send(message);
            logger.info("Verification code sent to: " + toEmail);
        } catch (Exception e) {
            logger.error("Failed to send verification code to " + toEmail, e);
        }
    }

    /**
     * Send contact message
     */
    public void sendContactMessage(String name, String userEmail, String subject, String messageText) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(EmailConstants.SENDER_EMAIL);
            message.setTo(EmailConstants.ADMIN_EMAIL);
            message.setReplyTo(userEmail);

            // Replace placeholders with actual values
            String contactSubject = EmailConstants.replacePlaceholder(
                    EmailConstants.CONTACT_MESSAGE_SUBJECT,
                    "SUBJECT",
                    subject);
            message.setSubject(contactSubject);

            String body = EmailConstants.CONTACT_MESSAGE_BODY;
            body = EmailConstants.replacePlaceholder(body, "USER_NAME", name);
            body = EmailConstants.replacePlaceholder(body, "USER_EMAIL", userEmail);
            body = EmailConstants.replacePlaceholder(body, "MESSAGE_TEXT", messageText);
            message.setText(body);

            mailSender.send(message);
            logger.info("Contact message sent from: " + userEmail);
        } catch (Exception e) {
            logger.error("Failed to send contact message from " + userEmail, e);
        }
    }
}