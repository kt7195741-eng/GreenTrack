package com.greentrack.backend.service;

import com.greentrack.backend.model.PasswordResetToken;

import com.greentrack.backend.model.SystemStatus;

import com.greentrack.backend.model.User;

import com.greentrack.backend.repository.PasswordResetTokenRepository;

import com.greentrack.backend.repository.UserRepository;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import java.time.OffsetDateTime;

import java.util.Collections;

import java.util.Optional;

import java.util.Random;

@Service

public class UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final PasswordResetTokenRepository tokenRepository;

    private final EmailService emailService;

    public UserService(UserRepository userRepository,

            PasswordEncoder passwordEncoder,

            PasswordResetTokenRepository tokenRepository,

            EmailService emailService) {

        this.userRepository = userRepository;

        this.passwordEncoder = passwordEncoder;

        this.tokenRepository = tokenRepository;

        this.emailService = emailService;

    }

    // --- REGISTER LOGIC ---

    @Transactional
    public User registerUser(User user) {

        // Check if email exists (regardless of status)
        Optional<User> existingUserOpt = userRepository.findByEmail(user.getEmail());

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();

            // If account is ACTIVE, reject the signup
            if (existingUser.getStatus() == SystemStatus.ACTIVE) {
                throw new RuntimeException("This email is already registered!");
            }

            // If account is PASSIVE (soft-deleted), reactivate it
            if (existingUser.getStatus() == SystemStatus.PASSIVE) {
                String hashedPassword = passwordEncoder.encode(user.getPassword());
                existingUser.setPassword(hashedPassword);
                existingUser.setStatus(SystemStatus.ACTIVE);
                existingUser.setName(user.getName()); // Update name if provided

                // Set SecurityContext so AuditorAware can pick up the user's name
                setSecurityContext(existingUser);

                return userRepository.save(existingUser);
            }
        }

        // If email doesn't exist, create new user
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);
        user.setStatus(SystemStatus.ACTIVE);

        // Set SecurityContext so AuditorAware can pick up the user's name
        setSecurityContext(user);

        return userRepository.save(user);

    }

    // --- LOGIN LOGIC ---

    public User loginUser(String email, String password) {

        Optional<User> userOptional = userRepository.findByEmailAndStatus(email, SystemStatus.ACTIVE);

        if (userOptional.isPresent()) {

            User user = userOptional.get();

            if (passwordEncoder.matches(password, user.getPassword())) {

                // Set SecurityContext so AuditorAware can pick up the user's name

                setSecurityContext(user);

                // Update last_seen on login

                user.setLastSeen(OffsetDateTime.now());

                userRepository.save(user);

                return user;

            } else {

                throw new RuntimeException("Invalid password!");

            }

        } else {

            throw new RuntimeException("User not found!");

        }

    }

    // --- UPDATE LAST SEEN ---

    public void updateLastSeen(String email) {

        User user = userRepository.findByEmailAndStatus(email, SystemStatus.ACTIVE)

                .orElseThrow(() -> new RuntimeException("User not found!"));

        user.setLastSeen(OffsetDateTime.now());

        userRepository.save(user);

    }

    // ====================================================================

    // PASSWORD RESET FLOW (3 steps)

    // ====================================================================

    @Transactional

    public void requestPasswordReset(String email) {

        if (userRepository.findByEmailAndStatus(email, SystemStatus.ACTIVE).isEmpty()) {

            throw new RuntimeException("No account found with this email!");

        }

        tokenRepository.deleteByEmail(email);

        String code = String.format("%06d", new Random().nextInt(999999));

        PasswordResetToken token = new PasswordResetToken();

        token.setEmail(email);

        token.setCode(code);

        token.setExpiryDate(LocalDateTime.now().plusMinutes(10));

        tokenRepository.save(token);

        emailService.sendVerificationCode(email, code);

    }

    public boolean verifyResetCode(String email, String code) {

        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByEmailAndCode(email, code);

        if (tokenOpt.isPresent()) {

            PasswordResetToken token = tokenOpt.get();

            if (token.isExpired()) {

                throw new RuntimeException("This code has expired! Please request a new one.");

            }

            return true;

        } else {

            throw new RuntimeException("Invalid verification code!");

        }

    }

    @Transactional

    public void resetPassword(String email, String code, String newPassword) {

        verifyResetCode(email, code);

        User user = userRepository.findByEmailAndStatus(email, SystemStatus.ACTIVE)

                .orElseThrow(() -> new RuntimeException("User not found!"));

        String hashedPassword = passwordEncoder.encode(newPassword);

        user.setPassword(hashedPassword);

        userRepository.save(user);

        tokenRepository.deleteByEmail(email);

    }

    // ====================================================================

    // PROFILE MANAGEMENT LOGIC

    // ====================================================================

    @Transactional

    public User updateName(String email, String newName) {

        User user = userRepository.findByEmailAndStatus(email, SystemStatus.ACTIVE)

                .orElseThrow(() -> new RuntimeException("User not found!"));

        user.setName(newName);

        return userRepository.save(user);

    }

    @Transactional

    public void updatePassword(String email, String currentPassword, String newPassword) {

        User user = userRepository.findByEmailAndStatus(email, SystemStatus.ACTIVE)

                .orElseThrow(() -> new RuntimeException("User not found!"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {

            throw new RuntimeException("Incorrect current password!");

        }

        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);

    }

    @Transactional

    public void softDeleteAccount(String email) {

        User user = userRepository.findByEmailAndStatus(email, SystemStatus.ACTIVE)

                .orElseThrow(() -> new RuntimeException("User not found!"));

        // Soft Delete: Data stays in DB, but user is locked out

        user.setStatus(SystemStatus.PASSIVE);

        userRepository.save(user);

    }

    // --- HELPER: Set SecurityContext so AuditorAware can read the user's name ---

    private void setSecurityContext(User user) {

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(user, null,

                Collections.emptyList());

        SecurityContextHolder.getContext().setAuthentication(authentication);

    }

}