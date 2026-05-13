package com.deepfake.backend.dto;

public record ReportRequest(
    String result,        
    Double confidence,    
    String heatmap_url    
) {}