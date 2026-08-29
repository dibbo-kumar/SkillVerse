package com.skillverse.controller;

import com.skillverse.model.MarketplaceItem;
import com.skillverse.repository.MarketplaceItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin(origins = "*")
public class MarketplaceController {

    private final MarketplaceItemRepository marketplaceRepository;

    public MarketplaceController(MarketplaceItemRepository marketplaceRepository) {
        this.marketplaceRepository = marketplaceRepository;
    }

    @GetMapping
    public ResponseEntity<List<MarketplaceItem>> getItems() {
        return ResponseEntity.ok(marketplaceRepository.findAll());
    }

    @GetMapping("/filter")
    public ResponseEntity<List<MarketplaceItem>> getItemsByType(@RequestParam String type) {
        return ResponseEntity.ok(marketplaceRepository.findByType(type));
    }
}
