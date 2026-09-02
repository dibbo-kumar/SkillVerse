package com.skillverse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "store_orders")
public class StoreOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderNumber; // e.g. #TS-10245

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "service_booking_id")
    private ServiceBooking serviceBooking; // Nullable for independent purchases

    private Double totalAmount;
    private Double subtotal;
    private Double deliveryFee = 60.0;
    private Double discount = 0.0;

    // Delivery Info
    private String customerName;
    private String phone;
    private String address;
    private String division;
    private String district;
    private String area;
    private String postalCode;
    private String deliveryInstructions;

    // Payment Info
    private String paymentMethod; // BKASH, NAGAD, ROCKET, CARD, CASH_ON_DELIVERY
    private String paymentStatus; // PENDING, PROCESSING, SUCCESSFUL, FAILED, CANCELLED, REFUNDED
    private String transactionId;

    // Status: ORDER_PLACED, PAYMENT_CONFIRMED, PROCESSING, PACKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    private String orderStatus;

    private LocalDateTime placedAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StoreOrderItem> items = new ArrayList<>();

    public StoreOrder() {
        this.placedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.paymentStatus = "PENDING";
        this.orderStatus = "ORDER_PLACED";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public ServiceBooking getServiceBooking() { return serviceBooking; }
    public void setServiceBooking(ServiceBooking serviceBooking) { this.serviceBooking = serviceBooking; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getDeliveryFee() { return deliveryFee; }
    public void setDeliveryFee(Double deliveryFee) { this.deliveryFee = deliveryFee; }

    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getDivision() { return division; }
    public void setDivision(String division) { this.division = division; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getDeliveryInstructions() { return deliveryInstructions; }
    public void setDeliveryInstructions(String deliveryInstructions) { this.deliveryInstructions = deliveryInstructions; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }

    public LocalDateTime getPlacedAt() { return placedAt; }
    public void setPlacedAt(LocalDateTime placedAt) { this.placedAt = placedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<StoreOrderItem> getItems() { return items; }
    public void setItems(List<StoreOrderItem> items) { 
        this.items = items;
        if (items != null) {
            for (StoreOrderItem item : items) {
                item.setOrder(this);
            }
        }
    }
    
    public void addItem(StoreOrderItem item) {
        this.items.add(item);
        item.setOrder(this);
    }
}
