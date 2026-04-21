package com.deepfake.backend.service.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.deepfake.backend.dto.ScanHistoryDto;
import com.deepfake.backend.entity.ScanHistory;
import com.deepfake.backend.repository.ScanHistoryRepository;
import com.deepfake.backend.service.ScanHistoryService;

@Service
public class ScanHistoryServiceImpl implements ScanHistoryService {

	@Autowired
	private ScanHistoryRepository scanHistoryRepository;
	
	@Override
	public ScanHistoryDto saveHistory(ScanHistoryDto scanHistoryDto) {
		ScanHistory scanHistory = com.deepfake.backend.mapper.ScanHistoryMapper.mapToScanHistory(scanHistoryDto);
		ScanHistory saved = scanHistoryRepository.save(scanHistory);
		return com.deepfake.backend.mapper.ScanHistoryMapper.mapToScanHistoryDto(saved);	
	}

	@Override
	public List<ScanHistoryDto> getAllScanHistories() {
		List<ScanHistory> scanHistoryList = scanHistoryRepository.findAll();
		return scanHistoryList.stream()
				.map(com.deepfake.backend.mapper.ScanHistoryMapper::mapToScanHistoryDto)
				.collect(java.util.stream.Collectors.toList());
	}

	@Override
	public ScanHistoryDto getScanHistoryById(Long id) {
		Optional<ScanHistory> optional = scanHistoryRepository.findById(id);
		if(optional.isPresent())
		{
			return com.deepfake.backend.mapper.ScanHistoryMapper.mapToScanHistoryDto(optional.get());
		}
		return null;
	}

	@Override
	public void deleteScanHistoryById(Long id) {
		Optional<ScanHistory> optional = scanHistoryRepository.findById(id);
		if(optional.isPresent()) {
			scanHistoryRepository.delete(optional.get());
		}
	}
}
