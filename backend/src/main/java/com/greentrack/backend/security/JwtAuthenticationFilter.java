package com.greentrack.backend.security;

import com.greentrack.backend.model.SystemStatus;
import com.greentrack.backend.model.User;
import com.greentrack.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.Collections;

/**
 * This filter runs once per request. It checks for a JWT in the
 * "Authorization: Bearer <token>" header. If valid, it sets the
 * Spring Security authentication context so the request is treated
 * as authenticated, and updates the user's last_seen timestamp.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // 1. Read the Authorization header
        String authHeader = request.getHeader("Authorization");

        // 2. If there's no Bearer token, skip this filter
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract the token (everything after "Bearer ")
        String token = authHeader.substring(7);

        // 4. Validate the token
        if (jwtUtil.isTokenValid(token)) {
            String email = jwtUtil.extractEmail(token);

            // 5. Make sure the user still exists and is ACTIVE (not soft-deleted)
            var userOpt = userRepository.findByEmailAndStatus(email, SystemStatus.ACTIVE);
            if (userOpt.isPresent()) {
                User user = userOpt.get();

                // 6. Update last_seen timestamp on every authenticated request
                user.setLastSeen(OffsetDateTime.now());
                userRepository.save(user);

                // 7. Tell Spring Security "this request is authenticated"
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        user, // the principal (current user)
                        null, // no credentials needed
                        Collections.emptyList() // no roles/authorities for now
                );
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        // 8. Continue with the rest of the filter chain
        filterChain.doFilter(request, response);
    }
}
