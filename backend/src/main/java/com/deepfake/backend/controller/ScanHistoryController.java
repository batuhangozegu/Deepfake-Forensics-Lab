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

import com.deepfake.backend.entity.ScanHistory;
import com.deepfake.backend.service.ScanHistoryService;


@RestController
@RequestMapping("/api/scan-history")
public class ScanHistoryController {

	@Autowired
	private ScanHistoryService scanHistoryService;
	
	@PostMapping(path = "/save")
	public ScanHistory saveScanHistory(@RequestBody ScanHistory scanHistory) {
		return scanHistoryService.saveHistory(scanHistory);
	}
	
	@GetMapping(path = "/list")
	public List<ScanHistory> getAllScanHistories(){
		return scanHistoryService.getAllScanHistories();
	}
	
	@GetMapping(path = "/list/{id}")
	public ScanHistory getScanHistoryById(@PathVariable Long id){
		return scanHistoryService.getScanHistoryById(id);
	}
	
	@DeleteMapping(path = "/delete/{id}")
	public void deleteScanHistoryById(@PathVariable Long id) {
		scanHistoryService.deleteScanHistoryById(id);
	}
	
}
