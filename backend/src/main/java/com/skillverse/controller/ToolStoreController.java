package com.skillverse.controller;

import com.skillverse.model.*;
import com.skillverse.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/store")
@CrossOrigin(origins = "*")
public class ToolStoreController {

    private final ToolStoreProductRepository productRepository;
    private final StoreCategoryRepository categoryRepository;
    private final StoreOrderRepository orderRepository;
    private final ProductReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ServiceBookingRepository bookingRepository;

    public ToolStoreController(ToolStoreProductRepository productRepository,
                               StoreCategoryRepository categoryRepository,
                               StoreOrderRepository orderRepository,
                               ProductReviewRepository reviewRepository,
                               UserRepository userRepository,
                               ServiceBookingRepository bookingRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    // ==========================================
    // PRODUCTS ENDPOINTS
    // ==========================================

    @GetMapping("/products")
    public ResponseEntity<List<ToolStoreProduct>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) String sort) {
        
        List<ToolStoreProduct> list;
        
        if (search != null && !search.trim().isEmpty()) {
            list = productRepository.searchProducts(search.trim());
        } else if (serviceType != null && !serviceType.trim().isEmpty()) {
            list = productRepository.findByCompatibleService(serviceType.trim());
        } else if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("All")) {
            list = productRepository.findByCategory(category.trim());
        } else if (type != null && !type.trim().isEmpty()) {
            list = productRepository.findByType(type.trim());
        } else {
            list = productRepository.findAll();
        }

        // Sorting logic
        if (sort != null) {
            switch (sort) {
                case "price_asc":
                    list.sort(Comparator.comparing(ToolStoreProduct::getPrice));
                    break;
                case "price_desc":
                    list.sort(Comparator.comparing(ToolStoreProduct::getPrice).reversed());
                    break;
                case "rating":
                    list.sort(Comparator.comparing(ToolStoreProduct::getRating).reversed());
                    break;
                case "discount":
                    list.sort(Comparator.comparing(ToolStoreProduct::getDiscountPercent).reversed());
                    break;
                case "popular":
                    list.sort(Comparator.comparing(ToolStoreProduct::getReviewCount).reversed());
                    break;
                default:
                    break;
            }
        }

        return ResponseEntity.ok(list);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ToolStoreProduct> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/products")
    public ResponseEntity<ToolStoreProduct> createOrUpdateProduct(@RequestBody ToolStoreProduct product) {
        if (product.getOldPrice() != null && product.getOldPrice() > product.getPrice()) {
            int disc = (int) Math.round(((product.getOldPrice() - product.getPrice()) / product.getOldPrice()) * 100);
            product.setDiscountPercent(disc);
        } else {
            product.setDiscountPercent(0);
        }
        if (product.getStockQuantity() != null) {
            product.setAvailable(product.getStockQuantity() > 0);
        }
        ToolStoreProduct saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // CATEGORIES ENDPOINTS
    // ==========================================

    @GetMapping("/categories")
    public ResponseEntity<List<StoreCategory>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping("/categories")
    public ResponseEntity<StoreCategory> createOrUpdateCategory(@RequestBody StoreCategory category) {
        if (category.getSlug() == null || category.getSlug().isEmpty()) {
            category.setSlug(category.getName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        }
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // ORDERS ENDPOINTS
    // ==========================================

    public static class OrderRequestDTO {
        public Long userId;
        public Long serviceBookingId;
        public String customerName;
        public String phone;
        public String address;
        public String division;
        public String district;
        public String area;
        public String postalCode;
        public String deliveryInstructions;
        public String paymentMethod;
        public List<CartItemDTO> items;
    }

    public static class CartItemDTO {
        public Long productId;
        public Integer quantity;
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequestDTO dto) {
        if (dto.userId == null || dto.items == null || dto.items.isEmpty()) {
            return ResponseEntity.badRequest().body("User ID and non-empty cart items required");
        }

        User user = userRepository.findById(dto.userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        ServiceBooking booking = null;
        if (dto.serviceBookingId != null) {
            booking = bookingRepository.findById(dto.serviceBookingId).orElse(null);
        }

        StoreOrder order = new StoreOrder();
        order.setUser(user);
        order.setServiceBooking(booking);
        order.setCustomerName(dto.customerName != null ? dto.customerName : user.getName());
        order.setPhone(dto.phone != null ? dto.phone : user.getPhone());
        order.setAddress(dto.address != null ? dto.address : user.getAddress());
        order.setDivision(dto.division != null ? dto.division : "Dhaka");
        order.setDistrict(dto.district != null ? dto.district : "Dhaka");
        order.setArea(dto.area != null ? dto.area : "Uttara");
        order.setPostalCode(dto.postalCode != null ? dto.postalCode : "1230");
        order.setDeliveryInstructions(dto.deliveryInstructions);
        order.setPaymentMethod(dto.paymentMethod != null ? dto.paymentMethod : "CASH_ON_DELIVERY");
        
        String randNum = String.format("%05d", new Random().nextInt(100000));
        order.setOrderNumber("#TS-" + randNum);

        double subtotal = 0.0;
        List<StoreOrderItem> orderItems = new ArrayList<>();

        for (CartItemDTO itemDto : dto.items) {
            ToolStoreProduct product = productRepository.findById(itemDto.productId).orElse(null);
            if (product != null) {
                int qty = itemDto.quantity != null ? itemDto.quantity : 1;
                
                // Inventory adjustment
                if (product.getStockQuantity() != null && product.getStockQuantity() >= qty) {
                    product.setStockQuantity(product.getStockQuantity() - qty);
                    productRepository.save(product);
                }

                StoreOrderItem orderItem = new StoreOrderItem(product, qty, product.getPrice());
                orderItem.setOrder(order);
                orderItems.add(orderItem);
                subtotal += orderItem.getSubtotal();
            }
        }

        order.setItems(orderItems);
        order.setSubtotal(subtotal);
        order.setDeliveryFee(60.0);
        order.setDiscount(0.0);
        order.setTotalAmount(subtotal + order.getDeliveryFee() - order.getDiscount());

        if ("CASH_ON_DELIVERY".equalsIgnoreCase(dto.paymentMethod)) {
            order.setPaymentStatus("PENDING");
            order.setOrderStatus("ORDER_PLACED");
        } else {
            // Online payment mock status
            order.setPaymentStatus("SUCCESSFUL");
            order.setTransactionId("TXN-" + System.currentTimeMillis());
            order.setOrderStatus("PAYMENT_CONFIRMED");
        }

        StoreOrder saved = orderRepository.save(order);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/orders/user/{userId}")
    public ResponseEntity<List<StoreOrder>> getUserOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(orderRepository.findByUserIdOrderByPlacedAtDesc(userId));
    }

    @GetMapping("/orders/number/{orderNumber}")
    public ResponseEntity<StoreOrder> getOrderByNumber(@PathVariable String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/orders/booking/{bookingId}")
    public ResponseEntity<List<StoreOrder>> getOrdersByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(orderRepository.findByServiceBookingId(bookingId));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<StoreOrder>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAllByOrderByPlacedAtDesc());
    }

    private int getStatusRank(String status) {
        if (status == null) return 0;
        switch (status.toUpperCase()) {
            case "ORDER_PLACED": return 1;
            case "PAYMENT_CONFIRMED": return 2;
            case "PROCESSING": return 3;
            case "PACKED": return 4;
            case "SHIPPED": return 5;
            case "OUT_FOR_DELIVERY": return 6;
            case "DELIVERED": return 7;
            case "CANCELLED": return 99;
            default: return 0;
        }
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return orderRepository.findById(id).map(order -> {
            if (payload.containsKey("orderStatus")) {
                String newStatus = payload.get("orderStatus");
                int currentRank = getStatusRank(order.getOrderStatus());
                int newRank = getStatusRank(newStatus);

                // Enforce forward-only status updates (except cancellation)
                if (newRank < currentRank && newRank != 99) {
                    return ResponseEntity.badRequest().body("Order status cannot be moved backwards from " + order.getOrderStatus() + " to " + newStatus);
                }
                order.setOrderStatus(newStatus);
                if ("DELIVERED".equalsIgnoreCase(newStatus)) {
                    order.setPaymentStatus("SUCCESSFUL");
                }
            }
            if (payload.containsKey("paymentStatus")) {
                order.setPaymentStatus(payload.get("paymentStatus"));
            }
            order.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(orderRepository.save(order));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        return orderRepository.findById(id).map(order -> {
            int currentRank = getStatusRank(order.getOrderStatus());
            if (currentRank >= 6) { // OUT_FOR_DELIVERY or DELIVERED
                return ResponseEntity.badRequest().body("Order cannot be cancelled once it is out for delivery or delivered.");
            }

            order.setOrderStatus("CANCELLED");
            order.setUpdatedAt(LocalDateTime.now());
            
            // Restore inventory stock
            if (order.getItems() != null) {
                for (StoreOrderItem item : order.getItems()) {
                    if (item.getProduct() != null) {
                        ToolStoreProduct product = item.getProduct();
                        int currentQty = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                        product.setStockQuantity(currentQty + item.getQuantity());
                        productRepository.save(product);
                    }
                }
            }

            return ResponseEntity.ok(orderRepository.save(order));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/payment/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> payload) {
        String orderNumber = payload.get("orderNumber");
        String transactionId = payload.get("transactionId");

        if (orderNumber == null) {
            return ResponseEntity.badRequest().body("Order number required");
        }

        return orderRepository.findByOrderNumber(orderNumber).map(order -> {
            order.setPaymentStatus("SUCCESSFUL");
            order.setOrderStatus("PAYMENT_CONFIRMED");
            order.setTransactionId(transactionId != null ? transactionId : "MOCK-TXN-" + System.currentTimeMillis());
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESSFUL",
                    "orderNumber", order.getOrderNumber(),
                    "transactionId", order.getTransactionId()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // REVIEWS ENDPOINTS
    // ==========================================

    @GetMapping("/reviews/product/{productId}")
    public ResponseEntity<List<ProductReview>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewRepository.findByProductIdOrderByCreatedAtDesc(productId));
    }

    public static class ReviewDTO {
        public Long productId;
        public Long userId;
        public Integer rating;
        public String comment;
        public String photoUrl;
    }

    @PostMapping("/reviews")
    public ResponseEntity<?> submitReview(@RequestBody ReviewDTO dto) {
        ToolStoreProduct product = productRepository.findById(dto.productId).orElse(null);
        User user = userRepository.findById(dto.userId).orElse(null);

        if (product == null || user == null) {
            return ResponseEntity.badRequest().body("Invalid product or user ID");
        }

        // Verify that user has an order with DELIVERED status containing this product
        boolean isDeliveredPurchase = orderRepository.findByUserIdOrderByPlacedAtDesc(dto.userId).stream()
                .filter(o -> "DELIVERED".equalsIgnoreCase(o.getOrderStatus()))
                .flatMap(o -> o.getItems().stream())
                .anyMatch(item -> item.getProduct() != null && item.getProduct().getId().equals(dto.productId));

        if (!isDeliveredPurchase) {
            return ResponseEntity.badRequest().body("You can only submit a review after the product has been delivered to you.");
        }

        ProductReview review = new ProductReview(product, user, dto.rating, dto.comment, true);
        if (dto.photoUrl != null && !dto.photoUrl.trim().isEmpty()) {
            review.setPhotoUrl(dto.photoUrl.trim());
        }
        reviewRepository.save(review);

        // Recalculate average rating & review count for product
        List<ProductReview> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(dto.productId);
        double avg = reviews.stream().mapToInt(ProductReview::getRating).average().orElse(5.0);
        product.setRating(Math.round(avg * 10.0) / 10.0);
        product.setReviewCount(reviews.size());
        productRepository.save(product);

        return ResponseEntity.ok(review);
    }

    // ==========================================
    // ADMIN DASHBOARD ANALYTICS ENDPOINT
    // ==========================================

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        List<ToolStoreProduct> products = productRepository.findAll();
        List<StoreOrder> orders = orderRepository.findAll();

        long totalProducts = products.size();
        long activeProducts = products.stream().filter(ToolStoreProduct::isAvailable).count();
        long outOfStock = products.stream().filter(p -> p.getStockQuantity() == null || p.getStockQuantity() == 0).count();
        long lowStock = products.stream().filter(p -> p.getStockQuantity() != null && p.getStockQuantity() > 0 && p.getStockQuantity() <= p.getLowStockThreshold()).count();

        long totalOrders = orders.size();
        long pendingOrders = orders.stream().filter(o -> "ORDER_PLACED".equals(o.getOrderStatus()) || "PROCESSING".equals(o.getOrderStatus())).count();
        long completedOrders = orders.stream().filter(o -> "DELIVERED".equals(o.getOrderStatus())).count();

        double totalSales = orders.stream()
                .filter(o -> !"CANCELLED".equals(o.getOrderStatus()) && !"REFUNDED".equals(o.getPaymentStatus()))
                .mapToDouble(StoreOrder::getTotalAmount)
                .sum();

        Map<String, Object> response = new HashMap<>();
        response.put("totalProducts", totalProducts);
        response.put("activeProducts", activeProducts);
        response.put("outOfStock", outOfStock);
        response.put("lowStock", lowStock);
        response.put("totalOrders", totalOrders);
        response.put("pendingOrders", pendingOrders);
        response.put("completedOrders", completedOrders);
        response.put("totalSales", totalSales);

        return ResponseEntity.ok(response);
    }
}
