package com.deepfake.backend.service;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.ParameterizedTypeReference;
import java.util.Map;
import java.util.HashMap;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.core.io.Resource;

@Service
public class AnalysisService {

	
	private final RestClient restClient;
	
	public AnalysisService(RestClient restClient) {
		this.restClient = restClient;
	}
	
	public com.deepfake.backend.dto.AnalysisResponse processVideoRequest(MultipartFile video, String modelName, String taskId) {
	
		try {
			MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
			body.add("video", video.getResource());
			body.add("ai_model", modelName);
			
			if (taskId != null && !taskId.isEmpty()) {
				body.add("task_id", taskId);
			}
			
			com.deepfake.backend.dto.AnalysisResponse response = restClient.post()
					.uri("http://localhost:8000/predict")
					.contentType(MediaType.MULTIPART_FORM_DATA)
					.body(body)
					.retrieve()
					.body(com.deepfake.backend.dto.AnalysisResponse.class);
			
			System.out.println("Cevap :" + response);
			return response;
			
		}catch (Exception e) {
			System.err.println("Python sunucusuna ulaşılamadı: " + e.getMessage());
			return new com.deepfake.backend.dto.AnalysisResponse("error", "HATA", 0.0, "Yapay Zeka sunucusu kapalı veya hata verdi.", null, null);
		}
	}
}
