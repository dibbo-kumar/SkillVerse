package com.skillverse.config;

import com.skillverse.model.*;
import com.skillverse.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import java.time.LocalDateTime;

@Configuration
public class DbInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final ServiceBookingRepository bookingRepository;
    private final CourseRepository courseRepository;
    private final MarketplaceItemRepository marketplaceRepository;

    public DbInitializer(UserRepository userRepository, WorkerProfileRepository workerProfileRepository,
                         ServiceBookingRepository bookingRepository, CourseRepository courseRepository,
                         MarketplaceItemRepository marketplaceRepository) {
        this.userRepository = userRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.bookingRepository = bookingRepository;
        this.courseRepository = courseRepository;
        this.marketplaceRepository = marketplaceRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Pre-populate users
        User admin = new User("System Admin", "admin@skillverse.com", "01711122233", "ADMIN");
        admin.setVerified(true);
        userRepository.save(admin);

        User customer = new User("Anisur Rahman", "anis@gmail.com", "01811223344", "CUSTOMER");
        customer.setVerified(true);
        customer.setProfilePicture("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop");
        userRepository.save(customer);

        // Pre-populate workers
        User worker1 = new User("Kamrul Islam", "kamrul@gmail.com", "01911223344", "WORKER");
        worker1.setVerified(true);
        worker1.setNidNumber("19942618954712365");
        worker1.setRating(4.8);
        worker1.setProfilePicture("https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&auto=format&fit=crop");
        userRepository.save(worker1);

        WorkerProfile profile1 = new WorkerProfile(worker1, "Electrical, AC Repair, Smart Home", 6, "Dhaka North (Gulshan, Banani, Uttara)", "Gold", 450.0);
        workerProfileRepository.save(profile1);

        User worker2 = new User("Mohammad Rafiq", "rafiq@gmail.com", "01511223344", "WORKER");
        worker2.setVerified(true);
        worker2.setNidNumber("19892618954785412");
        worker2.setRating(4.9);
        worker2.setProfilePicture("https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&auto=format&fit=crop");
        userRepository.save(worker2);

        WorkerProfile profile2 = new WorkerProfile(worker2, "Plumbing, Water Pump Repair", 10, "Dhaka South (Dhanmondi, Lalbagh, Motijheel)", "Master", 500.0);
        workerProfileRepository.save(profile2);

        User worker3 = new User("Sajid Hasan", "sajid@gmail.com", "01611223344", "WORKER");
        worker3.setVerified(false);
        worker3.setRating(4.2);
        worker3.setProfilePicture("https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop");
        userRepository.save(worker3);

        WorkerProfile profile3 = new WorkerProfile(worker3, "House Painting, Carpentry", 3, "Mirpur, Mohammadpur", "Bronze", 300.0);
        workerProfileRepository.save(profile3);

        // Pre-populate bookings
        ServiceBooking booking1 = new ServiceBooking(customer, worker1, "AC Repair & Servicing", LocalDateTime.now().plusDays(1), 1200.0, "AC unit not cooling effectively and makes noise.");
        bookingRepository.save(booking1);

        // Pre-populate courses
        courseRepository.save(new Course("Advanced HVAC & AC Repairing", "Master modern air conditioning installation, fault diagnosis, and eco-friendly gas recharging.", "Md. Asaduzzaman (Institution of Engineers, Bangladesh)", "12 Weeks", 4.9, 142, "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=300&auto=format&fit=crop"));
        courseRepository.save(new Course("Home Electrical Safety Standards", "Learn national grid standards, safety gear usage, and wiring diagnostics for residential buildings.", "Prof. Tasnim Ahmed (BUET)", "6 Weeks", 4.8, 210, "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=300&auto=format&fit=crop"));
        courseRepository.save(new Course("Professional Communication & Ethics", "Enhance customer interaction protocols, basic digital invoice operations, and time management skills.", "Farhana Yasmin (SkillVerse Training)", "3 Weeks", 4.7, 345, "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&auto=format&fit=crop"));

        // Pre-populate marketplace items
        marketplaceRepository.save(new MarketplaceItem("Industrial Pipe Wrench Set", "Durable heavy-duty wrench set, sizes 10, 14, and 18 inches.", 1550.0, "TOOL", "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=200&auto=format&fit=crop"));
        marketplaceRepository.save(new MarketplaceItem("AC Gas Charger Manifold Gauge", "Double valve manifold gauge with hose pipes for R22 and R410 refrigerant.", 2800.0, "TOOL", "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop"));
        marketplaceRepository.save(new MarketplaceItem("Submersible Water Pump Motor (1.5 HP)", "High efficiency copper winding motor with thermal overload protector.", 12500.0, "SPARE_PART", "https://images.unsplash.com/photo-1508962914676-134849a727f0?w=200&auto=format&fit=crop"));
        marketplaceRepository.save(new MarketplaceItem("Heavy Duty Demolition Jack Hammer (Rental)", "Rent per day: Professional grade concrete and rock breaker.", 800.0, "RENTAL", "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&auto=format&fit=crop"));

        System.out.println(">>> SkillVerse Database Pre-populated with Course & Marketplace Mock Data <<<");
    }
}
