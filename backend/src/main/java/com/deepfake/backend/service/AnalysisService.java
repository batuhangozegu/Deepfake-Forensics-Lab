package com.deepfake.backend.service;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AnalysisService {

	
	private final RestClient restClient;
	
	public AnalysisService(RestClient restClient) {
		this.restClient = restClient;
	}
	
	public String processVideoRequest(MultipartFile video, String modelName) {
	
		try {
			
			MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
			body.add("video", video.getResource());
			body.add("ai_model", modelName);
			
			
			String response = restClient.post()
					.uri("http://localhost:8000/predict")
					.contentType(MediaType.MULTIPART_FORM_DATA)
					.body(body)
					.retrieve()
					.body(String.class);
			
			System.out.println("Cevap :" + response);
			return response;
			
		}catch (Exception e) {
			System.err.println("Python sunucusuna ulaşılamadı: " + e.getMessage());
            return "{\"status\": \"error\", \"message\": \"Yapay Zeka sunucusu kapalı veya hata verdi.\"}";
		}
	}
}
