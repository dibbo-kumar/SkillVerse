package com.skillverse.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tool_store_products")
public class ToolStoreProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    @Column(length = 2000)
    private String description;

    private Double price;
    private Double oldPrice;
    private Integer discountPercent;
    
    private String type; // TOOL, SPARE_PART, ACCESSORY, REPLACEMENT, CONSUMABLE, EQUIPMENT
    private String category; // AC & Cooling, Refrigerator, Electrical, Plumbing, Fan, Tools
    private String brand;
    private String model;
    private String sku;
    
    private String imageUrl;
    
    @Column(length = 2000)
    private String imageGallery; // comma-separated URLs or JSON
    
    private boolean isAvailable = true;
    private Integer stockQuantity = 50;
    private Integer reservedStock = 0;
    private Integer lowStockThreshold = 5;
    
    private Double rating = 4.8;
    private Integer reviewCount = 12;

    @Column(length = 2000)
    private String specifications; // JSON string e.g. {"Voltage":"450V", "Capacity":"35 µF"}

    @Column(length = 1000)
    private String compatibleServices; // e.g., "AC Servicing / Repair, Refrigerator Repair"

    @Column(length = 1000)
    private String compatibleModels; // e.g., "Gree Fairy, Walton Inverter, General 1.5 Ton"

    private String warranty = "6 Months Warranty";

    public ToolStoreProduct() {}

    public ToolStoreProduct(String title, String description, Double price, Double oldPrice, String type, 
                            String category, String brand, String model, String sku, String imageUrl, 
                            Integer stockQuantity, String compatibleServices, String compatibleModels) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.oldPrice = oldPrice;
        if (oldPrice != null && oldPrice > price) {
            this.discountPercent = (int) Math.round(((oldPrice - price) / oldPrice) * 100);
        } else {
            this.discountPercent = 0;
        }
        this.type = type;
        this.category = category;
        this.brand = brand;
        this.model = model;
        this.sku = sku;
        this.imageUrl = imageUrl;
        this.stockQuantity = stockQuantity;
        this.compatibleServices = compatibleServices;
        this.compatibleModels = compatibleModels;
        this.isAvailable = stockQuantity > 0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Double getOldPrice() { return oldPrice; }
    public void setOldPrice(Double oldPrice) { this.oldPrice = oldPrice; }

    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getImageGallery() { return imageGallery; }
    public void setImageGallery(String imageGallery) { this.imageGallery = imageGallery; }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { 
        this.stockQuantity = stockQuantity; 
        this.isAvailable = stockQuantity != null && stockQuantity > 0;
    }

    public Integer getReservedStock() { return reservedStock; }
    public void setReservedStock(Integer reservedStock) { this.reservedStock = reservedStock; }

    public Integer getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(Integer lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public String getSpecifications() { return specifications; }
    public void setSpecifications(String specifications) { this.specifications = specifications; }

    public String getCompatibleServices() { return compatibleServices; }
    public void setCompatibleServices(String compatibleServices) { this.compatibleServices = compatibleServices; }

    public String getCompatibleModels() { return compatibleModels; }
    public void setCompatibleModels(String compatibleModels) { this.compatibleModels = compatibleModels; }

    public String getWarranty() { return warranty; }
    public void setWarranty(String warranty) { this.warranty = warranty; }
}
