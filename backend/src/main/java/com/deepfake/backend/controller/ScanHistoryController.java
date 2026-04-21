package com.deepfake.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.deepfake.backend.dto.ScanHistoryDto;
import com.deepfake.backend.service.ScanHistoryService;


@RestController
@RequestMapping("/api/scan-history")
@CrossOrigin
public class ScanHistoryController {

	@Autowired
	private ScanHistoryService scanHistoryService;
	
	@PostMapping(path = "/save")
	public ScanHistoryDto saveScanHistory(@RequestBody ScanHistoryDto scanHistoryDto) {
		return scanHistoryService.saveHistory(scanHistoryDto);
	}
	
	@GetMapping(path = "/list")
	public List<ScanHistoryDto> getAllScanHistories(){
		return scanHistoryService.getAllScanHistories();
	}
	
	@GetMapping(path = "/list/{id}")
	public ScanHistoryDto getScanHistoryById(@PathVariable Long id){
		return scanHistoryService.getScanHistoryById(id);
	}
	
	@DeleteMapping(path = "/delete/{id}")
	public void deleteScanHistoryById(@PathVariable Long id) {
		scanHistoryService.deleteScanHistoryById(id);
	}
	
	@PostMapping(path = "/update-report/{id}")
	public ScanHistoryDto updateReport(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
		ScanHistoryDto scanHistoryDto = scanHistoryService.getScanHistoryById(id);
		if(scanHistoryDto != null && payload.containsKey("reportText")) {
			scanHistoryDto.setReportText(payload.get("reportText"));
			return scanHistoryService.saveHistory(scanHistoryDto);
		}
		return null;
	}
	
}
