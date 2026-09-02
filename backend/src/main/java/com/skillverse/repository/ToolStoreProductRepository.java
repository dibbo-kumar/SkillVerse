package com.skillverse.repository;

import com.skillverse.model.ToolStoreProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ToolStoreProductRepository extends JpaRepository<ToolStoreProduct, Long> {

    List<ToolStoreProduct> findByCategory(String category);

    List<ToolStoreProduct> findByType(String type);

    @Query("SELECT p FROM ToolStoreProduct p WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.model) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<ToolStoreProduct> searchProducts(@Param("query") String query);

    @Query("SELECT p FROM ToolStoreProduct p WHERE " +
           "LOWER(p.compatibleServices) LIKE LOWER(CONCAT('%', :serviceType, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :serviceType, '%'))")
    List<ToolStoreProduct> findByCompatibleService(@Param("serviceType") String serviceType);
}
