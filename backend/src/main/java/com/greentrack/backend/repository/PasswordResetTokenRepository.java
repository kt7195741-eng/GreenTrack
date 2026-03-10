package com.greentrack.backend.repository;

import com.greentrack.backend.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    // Find a token by email AND code (used during verification)
    Optional<PasswordResetToken> findByEmailAndCode(String email, String code);

    // Delete all old tokens for this email (cleanup when requesting a new code)
    void deleteByEmail(String email);
}
