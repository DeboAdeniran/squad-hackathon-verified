package com.verified.service;

import com.verified.dto.request.LoginRequest;
import com.verified.dto.request.RegisterRequest;
import com.verified.dto.response.AuthResponse;
import com.verified.dto.response.RegisterResponse;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    RegisterResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request, HttpServletResponse response);
    void logout(HttpServletResponse response);
}
