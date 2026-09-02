package com.skillverse.repository;

import com.skillverse.model.StoreCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoreCategoryRepository extends JpaRepository<StoreCategory, Long> {
    Optional<StoreCategory> findBySlug(String slug);
    Optional<StoreCategory> findByName(String name);
}
