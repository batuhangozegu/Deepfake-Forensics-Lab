package com.deepfake.backend.entity;

import lombok.Data;

@Data
public class ScanHistory {

	// TODO: Bölüm 3 (JPA) izlendikten sonra buralara veritabanı anotasyonları gelecek.
	private Long id;
	private String fileName;
	private String aiModel;
	private String result;
	private double confidenceScore;
	
}
