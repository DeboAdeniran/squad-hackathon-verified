package com.verified.controller;

import com.verified.dto.request.ClaimReviewRequest;
import com.verified.dto.request.ClaimSubmitRequest;
import com.verified.dto.response.*;
import com.verified.service.ClaimService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
@Tag(name = "Claims", description = "Submit and manage insurance claims")
public class ClaimController {
    private final ClaimService claimService;
    @Operation(summary = "Submit a new insurance claim")
    @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ClaimSubmitResponse> submit(
            @RequestPart("data") @Valid ClaimSubmitRequest request,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos,
            @RequestPart(value = "documents", required = false) List<MultipartFile> documents) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(claimService.submitClaim(request, photos, documents));
    }

    @Operation(summary = "Verify bank account number before claim submission")
    @GetMapping("/verify-account")
    public ResponseEntity<AccountLookupResponse> verifyAccount(
            @RequestParam String bankCode,
            @RequestParam String accountNumber) {
        return ResponseEntity.ok(claimService.lookupBankAccount(bankCode, accountNumber));
    }
    @Operation(summary = "Upload photos and documents for a claim")
    @PostMapping(value = "/{id}/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ClaimFileResponse> uploadFiles(
            @PathVariable UUID id,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("fileType") String fileType) {
        return ResponseEntity.ok(claimService.uploadFiles(id, files, fileType));
    }
    @Operation(summary = "Poll for claim scoring result")
    @GetMapping("/{id}/result")
    public ResponseEntity<ClaimResultResponse> getResult(@PathVariable UUID id) {
        return ResponseEntity.ok(claimService.getClaimResult(id));
    }
    @Operation(summary = "Get paginated list of all claims with filters")
    @GetMapping
    public ResponseEntity<Page<ClaimSummaryResponse>> getAllClaims(
            @RequestParam(required = false) String tier,
            @RequestParam(required = false) String claimType,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC,"createdAt"));
        return ResponseEntity.ok(claimService.getAllClaims(tier, claimType, status, pageable));
    }
    @Operation(summary = "Get full detail for a single claim")
    @GetMapping("/{id}")
    public ResponseEntity<ClaimDetailResponse> getDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(claimService.getClaimDetail(id));
    }
    @Operation(summary = "Approve or reject a REVIEW-tier claim")
    @PostMapping("/{id}/review")
    public ResponseEntity<Void> reviewClaim(@PathVariable UUID id,
                                            @Valid @RequestBody ClaimReviewRequest request) {
        claimService.reviewClaim(id, request);
        return ResponseEntity.ok().build();
    }

}
