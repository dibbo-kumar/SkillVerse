package com.skillverse.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "store_order_items")
public class StoreOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private StoreOrder order;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private ToolStoreProduct product;

    private String productTitle;
    private String productCategory;
    private String productImageUrl;
    
    private Integer quantity;
    private Double unitPrice;
    private Double subtotal;

    public StoreOrderItem() {}

    public StoreOrderItem(ToolStoreProduct product, Integer quantity, Double unitPrice) {
        this.product = product;
        if (product != null) {
            this.productTitle = product.getTitle();
            this.productCategory = product.getCategory();
            this.productImageUrl = product.getImageUrl();
        }
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = quantity * unitPrice;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public StoreOrder getOrder() { return order; }
    public void setOrder(StoreOrder order) { this.order = order; }

    public ToolStoreProduct getProduct() { return product; }
    public void setProduct(ToolStoreProduct product) { this.product = product; }

    public String getProductTitle() { return productTitle; }
    public void setProductTitle(String productTitle) { this.productTitle = productTitle; }

    public String getProductCategory() { return productCategory; }
    public void setProductCategory(String productCategory) { this.productCategory = productCategory; }

    public String getProductImageUrl() { return productImageUrl; }
    public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { 
        this.quantity = quantity; 
        if (this.unitPrice != null) {
            this.subtotal = quantity * this.unitPrice;
        }
    }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { 
        this.unitPrice = unitPrice; 
        if (this.quantity != null) {
            this.subtotal = this.quantity * unitPrice;
        }
    }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
}
