package com.deepfake.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

import com.deepfake.backend.service.AnalysisService;

@RestController

@RequestMapping("/api/analysis")
@CrossOrigin
public class AnalysisController {

	@Autowired
    private AnalysisService analysisService;
	
	
	@PostMapping(value = "/analyze", produces = "application/json")
	public com.deepfake.backend.dto.AnalysisResponse analyzeVideo(
			@RequestParam("video") MultipartFile videoFile,
			@RequestParam("ai_model") String aiModel,
			@RequestParam(value = "task_id", required = false) String taskId ){
		
		System.out.println("Controller çalıştı, servise iletiliyor... Task ID: " + taskId);
		return analysisService.processVideoRequest(videoFile, aiModel, taskId);
	}
	
}
