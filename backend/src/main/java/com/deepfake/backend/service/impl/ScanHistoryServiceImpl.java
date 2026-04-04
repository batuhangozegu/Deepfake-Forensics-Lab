package com.deepfake.backend.service.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.deepfake.backend.entity.ScanHistory;
import com.deepfake.backend.repository.ScanHistoryRepository;
import com.deepfake.backend.service.ScanHistoryService;

@Service
public class ScanHistoryServiceImpl implements ScanHistoryService {

	@Autowired
	private ScanHistoryRepository scanHistoryRepository;
	
	@Override
	public ScanHistory saveHistory(ScanHistory scanHistory) {
		return scanHistoryRepository.save(scanHistory);	
	}

	@Override
	public List<ScanHistory> getAllScanHistories() {
		List<ScanHistory> scanHistoryList = scanHistoryRepository.findAll();
		return scanHistoryList;
	}

	@Override
	public ScanHistory getScanHistoryById(Long id) {
		Optional<ScanHistory> optional = scanHistoryRepository.findById(id);
		if(optional.isPresent())
		{
			return optional.get();
		}
		return null;
	}

	@Override
	public void deleteScanHistoryById(Long id) {
		ScanHistory dbScanHistory = getScanHistoryById(id);
		if(dbScanHistory != null) {
		scanHistoryRepository.delete(dbScanHistory);
		}
	}
}
