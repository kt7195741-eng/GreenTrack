package com.greentrack.backend.repository;

import com.greentrack.backend.model.SystemStatus;

import com.greentrack.backend.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository

public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Boot magically writes the SQL query for this behind the scenes!

    // We will need this to check if a user exists during Login.

    Optional<User> findByEmail(String email);

    // Find a user by email, but only if they are ACTIVE (not soft-deleted)

    Optional<User> findByEmailAndStatus(String email, SystemStatus status);

    // Find a user by email, excluding a specific status (e.g. DELETED)

    Optional<User> findByEmailAndStatusNot(String email, SystemStatus status);

    // We will need this to make sure someone doesn't register twice.

    boolean existsByEmail(String email);

}