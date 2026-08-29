package com.skillverse.repository;

import com.skillverse.model.MarketplaceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MarketplaceItemRepository extends JpaRepository<MarketplaceItem, Long> {
    List<MarketplaceItem> findByType(String type);
}
