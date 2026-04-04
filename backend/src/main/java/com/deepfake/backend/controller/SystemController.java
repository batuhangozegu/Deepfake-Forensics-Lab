package com.deepfake.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;


@RestController


@RequestMapping("/api/system")
public class SystemController {

	
	@GetMapping("/status")
	public String checkStatus() {
		return "Sunucu aktif";
	}
	

}
