package com.greentrack.backend.model;

import java.time.OffsetDateTime;

import jakarta.persistence.*;

import lombok.Data;

import lombok.EqualsAndHashCode;

@Data

@EqualsAndHashCode(callSuper = true)

@Entity

@Table(name = "users")

public class User extends BaseEntity {

    @Id

    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;

    @Column(nullable = false)

    private String name;

    @Column(unique = true, nullable = false)

    private String email;

    @Column(nullable = false)

    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)

    private String password;

    @Column(name = "profile_photo", columnDefinition = "TEXT")

    private String profilePhoto;

    @Column(name = "last_seen")

    private OffsetDateTime lastSeen;

}