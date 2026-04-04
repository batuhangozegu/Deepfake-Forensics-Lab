package com.deepfake.backend.service;

import java.util.List;

import com.deepfake.backend.entity.ScanHistory;

public interface ScanHistoryService {

	public ScanHistory saveHistory(ScanHistory scanHistory);
	public List<ScanHistory> getAllScanHistories();
	public ScanHistory getScanHistoryById(Long id);
	public void deleteScanHistoryById(Long id);
	
}
