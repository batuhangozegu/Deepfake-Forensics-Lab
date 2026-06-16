package com.deepfake.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.deepfake.backend.entity.ScanHistory;

import java.util.List;

@Repository
public interface ScanHistoryRepository extends JpaRepository<ScanHistory, Long>{
	List<ScanHistory> findByUserId(Long userId);
}

