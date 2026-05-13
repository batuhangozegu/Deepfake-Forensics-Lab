package com.deepfake.backend.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "scan_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScanHistory {


	@Id
	@Column(name = "id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "file_name", nullable = false)
	private String fileName;
	
	@Column(name = "ai_model", nullable = false)
	private String aiModel;
	
	@Column(name = "result", nullable = false)
	private String result;
	
	@Column(name = "confidence_score", nullable = false)
	private double confidenceScore;
	
	@Column(name = "heatmap_url", length = 500)
	private String heatmapUrl;
	
	@Column(name = "heatmap_video_url", length = 500)
	private String heatmapVideoUrl;
	
	@CreationTimestamp
    @DateTimeFormat(iso = ISO.DATE_TIME)
	@Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
	
	@Column(name = "report_text", columnDefinition = "TEXT")
	private String reportText;
	
}
