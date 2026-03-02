package com.skatemaps.repository;

import com.skatemaps.entity.Spot;
import com.skatemaps.entity.SpotImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpotImageRepository extends JpaRepository<SpotImage, Long> {
}
