package com.verified.service.implementation;

import com.verified.dto.request.RegisterRequest;
import com.verified.dto.response.RegisterResponse;
import com.verified.model.UserEntity;
import com.verified.repository.UserRepository;
import com.verified.security.JwtService;
import com.verified.security.UserDetailsServiceImpl;
import com.verified.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    @Override
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email already registered");
        }

        UserEntity user = UserEntity.builder()
                .email(request.getEmail())
                .password(bCryptPasswordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .build();

        UserEntity savedUser = userRepository.save(user);
        return RegisterResponse.builder()
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(request.getRole())
                .message("Account Created Successfully")
                .build();
    }
}
