package com.deepfake.backend.service;

import java.util.List;

import com.deepfake.backend.dto.ScanHistoryDto;
import com.deepfake.backend.entity.ScanHistory;

public interface ScanHistoryService {

	public ScanHistoryDto saveHistory(ScanHistoryDto scanHistoryDto);
	public List<ScanHistoryDto> getAllScanHistories();
	public ScanHistoryDto getScanHistoryById(Long id);
	public void deleteScanHistoryById(Long id);
	
}
