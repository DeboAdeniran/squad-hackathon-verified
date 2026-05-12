package com.verified.service.implementation;

import com.verified.model.Claim;
import com.verified.model.TrustScore;
import com.verified.service.SquadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SquadServiceImpl implements SquadService {
    @Override
    public void processPayment(Claim claim, TrustScore trustScore) {
        log.info("Squad payment stub called for claim {} with action {}",
                claim.getId(), trustScore.getSquadAction());
    }
}
