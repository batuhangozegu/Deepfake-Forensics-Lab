package com.deepfake.backend.dto;

public record AnalysisResponse(
    String status,
    String result,
    Double confidence,
    String details,
    String heatmap_url,
    String heatmap_video_url
) {}
