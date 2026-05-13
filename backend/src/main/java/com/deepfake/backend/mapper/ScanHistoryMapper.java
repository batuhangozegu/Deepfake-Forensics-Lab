package com.deepfake.backend.mapper;

import com.deepfake.backend.dto.ScanHistoryDto;
import com.deepfake.backend.entity.ScanHistory;

public class ScanHistoryMapper {

    public static ScanHistoryDto mapToScanHistoryDto(ScanHistory scanHistory) {
        if (scanHistory == null) return null;
        return new ScanHistoryDto(
            scanHistory.getId(),
            scanHistory.getFileName(),
            scanHistory.getAiModel(),
            scanHistory.getResult(),
            scanHistory.getConfidenceScore(),
            scanHistory.getHeatmapUrl(),
            scanHistory.getHeatmapVideoUrl(),
            scanHistory.getCreatedAt(),
            scanHistory.getReportText()
        );
    }

    public static ScanHistory mapToScanHistory(ScanHistoryDto scanHistoryDto) {
        if (scanHistoryDto == null) return null;
        return new ScanHistory(
            scanHistoryDto.getId(),
            scanHistoryDto.getFileName(),
            scanHistoryDto.getAiModel(),
            scanHistoryDto.getResult(),
            scanHistoryDto.getConfidenceScore(),
            scanHistoryDto.getHeatmapUrl(),
            scanHistoryDto.getHeatmapVideoUrl(),
            scanHistoryDto.getCreatedAt(),
            scanHistoryDto.getReportText()
        );
    }
}
