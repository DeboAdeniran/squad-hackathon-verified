package com.verified.service;

import com.verified.dto.request.RegisterRequest;
import com.verified.dto.response.RegisterResponse;

public interface AuthService {
    RegisterResponse register(RegisterRequest request);
}
