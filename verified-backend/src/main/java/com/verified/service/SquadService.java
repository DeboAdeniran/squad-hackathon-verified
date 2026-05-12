package com.verified.service;

import com.verified.model.Claim;
import com.verified.model.TrustScore;

public interface SquadService {
    void processPayment(Claim claim, TrustScore trustScore);
}
