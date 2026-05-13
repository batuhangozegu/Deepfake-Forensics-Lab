package com.deepfake.backend.service;

import com.deepfake.backend.dto.ReportRequest;

public interface ReportService {

	String generateReport(ReportRequest request);
	
}
