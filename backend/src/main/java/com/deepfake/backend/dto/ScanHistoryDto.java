package com.deepfake.backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScanHistoryDto {
    private Long id;
    private String fileName;
    private String aiModel;
    private String result;
    private double confidenceScore;
    private String heatmapUrl;
    private LocalDateTime createdAt;
    private String reportText;
}
