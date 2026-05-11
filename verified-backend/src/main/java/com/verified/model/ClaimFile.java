package com.verified.model;

import com.verified.model.enums.FileType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "claim_files")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimFile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id ;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;
    @Enumerated(EnumType.STRING)
    private FileType fileType;
    @Column(columnDefinition = "TEXT", nullable = false)
    private String fileUrl;
    @CreationTimestamp
    private LocalDateTime uploadedAt;
}
