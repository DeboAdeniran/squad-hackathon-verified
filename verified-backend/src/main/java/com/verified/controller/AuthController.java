package com.verified.controller;

import com.verified.dto.request.LoginRequest;
import com.verified.dto.request.RegisterRequest;
import com.verified.dto.response.AuthResponse;
import com.verified.dto.response.RegisterResponse;
import com.verified.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login and logout")
public class AuthController {
    private final AuthService authService;

    @Operation(summary = "Register a new adjudicator account")
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request){
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @Operation(summary = "Login and receive HttpOnly cookie")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletResponse response){
        return ResponseEntity.status(HttpStatus.OK).body(authService.login(request,response));
    }

    @Operation(summary = "Logout and clear cookie")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response){
        authService.logout(response);
        return ResponseEntity.noContent().build();
    }
}
