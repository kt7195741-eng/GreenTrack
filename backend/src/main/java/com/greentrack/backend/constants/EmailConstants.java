package com.greentrack.backend.constants;

/**
 * Email content constants and templates
 * Centralized location for all email subjects and body content
 */
public class EmailConstants {

        // ====================================================================
        // EMAIL CONFIGURATION
        // ====================================================================
        public static final String SENDER_EMAIL = "kt7195741@gmail.com";
        public static final String ADMIN_EMAIL = "kt7195741@gmail.com";

        // ====================================================================
        // SIGNUP EMAIL (Registration - sent only ONCE when user registers)
        // ====================================================================
        public static final String SIGNUP_EMAIL_SUBJECT = "Welcome to GreenTrack! 🌱";

        public static final String SIGNUP_EMAIL_BODY = "Hello {USER_NAME},\n\n" +
                        "Welcome to GreenTrack!\n\n" +
                        "Thank you for joining us! Your account has been successfully created.\n" +
                        "You are now part of our community dedicated to tracking plants and reducing carbon footprint.\n\n"
                        +
                        "Get started:\n" +
                        "1. Log in to your account\n" +
                        "2. Add your first plant\n" +
                        "3. Start tracking your environmental impact\n\n" +
                        "We're excited to have you on board!\n\n" +
                        "Best regards,\n" +
                        "The GreenTrack Team\n\n" +
                        "🌿 Growing a sustainable future, one plant at a time.";

        // ====================================================================
        // PASSWORD RESET VERIFICATION CODE
        // ====================================================================
        public static final String PASSWORD_RESET_SUBJECT = "Green-Track: Şifre Sıfırlama Kodu / Password Reset";

        public static final String PASSWORD_RESET_BODY = "Merhaba!\n\n" +
                        "Your Green-Track password reset code is: {RESET_CODE}\n\n" +
                        "Lütfen bu kodu kimseyle paylaşmayın. (Please do not share this code with anyone.)\n\n" +
                        "Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.";

        // ====================================================================
        // CONTACT MESSAGE (From Contact Form)
        // ====================================================================
        public static final String CONTACT_MESSAGE_SUBJECT = "Green-Track Contact: {SUBJECT}";

        public static final String CONTACT_MESSAGE_BODY = "Message from: {USER_NAME}\n" +
                        "Email: {USER_EMAIL}\n\n" +
                        "{MESSAGE_TEXT}";

        // ====================================================================
        // HELPER METHOD: Replace placeholders
        // ====================================================================

        /**
         * Replace placeholder {PLACEHOLDER} with actual value
         * Example: replacePlaceholder(template, "USER_NAME", "John")
         * replaces {USER_NAME} with "John"
         */
        public static String replacePlaceholder(String template, String placeholder, String value) {
                return template.replace("{" + placeholder + "}", value != null ? value : "");
        }
}