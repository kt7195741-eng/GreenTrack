package com.greentrack.backend.controller;

import com.greentrack.backend.model.User;
import com.greentrack.backend.security.JwtUtil;
import com.greentrack.backend.service.EmailService;
import com.greentrack.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User management APIs")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public UserController(UserService userService, JwtUtil jwtUtil, EmailService emailService) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    @Operation(summary = "Register a new user")
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User savedUser = userService.registerUser(user);
            String token = jwtUtil.generateToken(savedUser.getEmail());

            // Send signup email asynchronously (non-blocking)
            new Thread(() -> {
                emailService.sendSignupEmail(savedUser.getEmail(), savedUser.getName());
            }).start();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration Successful");
            response.put("token", token);
            response.put("user", savedUser);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @Operation(summary = "Login a user")
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginData) {
        try {
            String email = loginData.get("email");
            String password = loginData.get("password");
            User loggedInUser = userService.loginUser(email, password);
            String token = jwtUtil.generateToken(loggedInUser.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", loggedInUser);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @Operation(summary = "Logout a user")
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @Operation(summary = "Request a password reset code")
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            userService.requestPasswordReset(email);
            return ResponseEntity.ok(Map.of("message", "Verification code sent to your email!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @Operation(summary = "Verify a password reset code")
    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");
            userService.verifyResetCode(email, code);
            return ResponseEntity.ok(Map.of("message", "Code verified successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @Operation(summary = "Reset user password")
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");
            String newPassword = request.get("newPassword");
            userService.resetPassword(email, code, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password has been reset successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @Operation(summary = "Send a contact form message")
    @PostMapping("/contact")
    public ResponseEntity<?> submitContactForm(@RequestBody Map<String, String> payload) {
        try {
            String name = payload.get("name");
            String email = payload.get("email");
            String subject = payload.get("subject");
            String message = payload.get("message");

            emailService.sendContactMessage(name, email, subject, message);

            return ResponseEntity.ok(Map.of("message", "Message sent successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to send message: " + e.getMessage()));
        }
    }

    // ====================================================================
    // PROFILE MANAGEMENT ENDPOINTS
    // ====================================================================

    @Operation(summary = "Update user's name")
    @PutMapping("/update-name")
    public ResponseEntity<?> updateName(@RequestParam String email, @RequestParam String newName) {
        try {
            User updatedUser = userService.updateName(email, newName);
            return ResponseEntity.ok(Map.of(
                    "message", "Name updated successfully!",
                    "user", updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @Operation(summary = "Update user's password")
    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            String oldPassword = payload.get("oldPassword");
            String newPassword = payload.get("newPassword");

            userService.updatePassword(email, oldPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @Operation(summary = "Soft delete user account")
    @DeleteMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(@RequestParam String email) {
        try {
            userService.softDeleteAccount(email);
            return ResponseEntity.ok(Map.of("message", "Account successfully deactivated."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}