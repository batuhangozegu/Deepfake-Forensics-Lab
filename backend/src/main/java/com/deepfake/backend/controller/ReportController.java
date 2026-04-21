package com.deepfake.backend.controller;

import com.deepfake.backend.dto.ReportRequest;
import com.deepfake.backend.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/report")
@CrossOrigin(origins = "*") 
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/generate")
    public ResponseEntity<com.deepfake.backend.dto.ReportResponse> generateReport(@RequestBody ReportRequest request) {
        
        String generatedReport = reportService.generateReport(request);
        
        return ResponseEntity.ok(new com.deepfake.backend.dto.ReportResponse(
                "success",
                generatedReport
        ));
    }
}