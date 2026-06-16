package com.deepfake.backend.service;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AnalysisService {

    private final RestTemplate restTemplate;

    public AnalysisService() {
        this.restTemplate = new RestTemplate();
    }

    public com.deepfake.backend.dto.AnalysisResponse processVideoRequest(MultipartFile video, String modelName, String taskId) {

        try {
            // Dosyayı bir ByteArrayResource olarak sar, dosya adını mutlaka ekle
            ByteArrayResource videoResource = new ByteArrayResource(video.getBytes()) {
                @Override
                public String getFilename() {
                    return video.getOriginalFilename() != null ? video.getOriginalFilename() : "video.mp4";
                }
            };

            // Multipart form body oluştur
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("video", videoResource);
            body.add("ai_model", modelName);
            if (taskId != null && !taskId.isEmpty()) {
                body.add("task_id", taskId);
            }

            // Header'a multipart content type ekle (boundary otomatik oluşturulur)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            System.out.println("Python'a istek gönderiliyor... Dosya: " + videoResource.getFilename());

            ResponseEntity<com.deepfake.backend.dto.AnalysisResponse> responseEntity =
                restTemplate.postForEntity(
                    "http://localhost:8000/predict",
                    requestEntity,
                    com.deepfake.backend.dto.AnalysisResponse.class
                );

            com.deepfake.backend.dto.AnalysisResponse response = responseEntity.getBody();
            System.out.println("Cevap: " + response);
            return response;

        } catch (Exception e) {
            System.err.println("Python sunucusuna ulaşılamadı: " + e.getMessage());
            e.printStackTrace();
            return new com.deepfake.backend.dto.AnalysisResponse("error", "HATA", 0.0, "Yapay Zeka sunucusu kapalı veya hata verdi.", null, null, null);
        }
    }
}
