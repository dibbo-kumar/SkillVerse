package com.skillverse.model;

import jakarta.persistence.*;

@Entity
@Table(name = "marketplace_items")
public class MarketplaceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private Double price;
    private String type; // TOOL, SPARE_PART, RENTAL
    private String imageUrl;
    private boolean isAvailable;

    public MarketplaceItem() {}

    public MarketplaceItem(String title, String description, Double price, String type, String imageUrl) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.type = type;
        this.imageUrl = imageUrl;
        this.isAvailable = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }
}
