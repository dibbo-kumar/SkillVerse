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
    private final VerificationRequestRepository verificationRequestRepository;

    public DbInitializer(UserRepository userRepository, WorkerProfileRepository workerProfileRepository,
                         ServiceBookingRepository bookingRepository, CourseRepository courseRepository,
                         MarketplaceItemRepository marketplaceRepository,
                         VerificationRequestRepository verificationRequestRepository) {
        this.userRepository = userRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.bookingRepository = bookingRepository;
        this.courseRepository = courseRepository;
        this.marketplaceRepository = marketplaceRepository;
        this.verificationRequestRepository = verificationRequestRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return;
        }

        // Pre-populate users
        User admin = new User("System Admin", "admin@skillverse.com", "01711122233", "ADMIN");
        admin.setVerified(true);
        userRepository.save(admin);

        User customer = new User("Anisur Rahman", "anis@gmail.com", "01811223344", "CUSTOMER");
        customer.setVerified(true);
        customer.setLatitude(23.8759);
        customer.setLongitude(90.3795);
        customer.setAddress("House 14, Road 4, Sector 12, Uttara, Dhaka");
        customer.setProfilePicture("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop");
        userRepository.save(customer);

        // Pre-populate workers
        User worker1 = new User("Kamrul Islam", "kamrul@gmail.com", "01911223344", "WORKER");
        worker1.setVerified(true);
        worker1.setNidNumber("19942618954712365");
        worker1.setRating(4.8);
        worker1.setLatitude(23.8720);
        worker1.setLongitude(90.3810);
        worker1.setAddress("Sector 11, Uttara, Dhaka");
        worker1.setProfilePicture("https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&auto=format&fit=crop");
        userRepository.save(worker1);

        WorkerProfile profile1 = new WorkerProfile(worker1, "Electrical, AC Repair, Smart Home", 6, "Dhaka North (Gulshan, Banani, Uttara)", "Gold", 450.0);
        profile1.setLatitude(23.8720);
        profile1.setLongitude(90.3810);
        workerProfileRepository.save(profile1);

        User worker2 = new User("Mohammad Rafiq", "rafiq@gmail.com", "01511223344", "WORKER");
        worker2.setVerified(true);
        worker2.setNidNumber("19892618954785412");
        worker2.setRating(4.9);
        worker2.setLatitude(23.7461);
        worker2.setLongitude(90.3742);
        worker2.setAddress("Road 9A, Dhanmondi, Dhaka");
        worker2.setProfilePicture("https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&auto=format&fit=crop");
        userRepository.save(worker2);

        WorkerProfile profile2 = new WorkerProfile(worker2, "Plumbing, Water Pump Repair", 10, "Dhaka South (Dhanmondi, Lalbagh, Motijheel)", "Master", 500.0);
        profile2.setLatitude(23.7461);
        profile2.setLongitude(90.3742);
        workerProfileRepository.save(profile2);

        User worker3 = new User("Sajid Hasan", "sajid@gmail.com", "01611223344", "WORKER");
        worker3.setVerified(false);
        worker3.setNidNumber("19972618954712999");
        worker3.setRating(4.5);
        worker3.setLatitude(23.8050);
        worker3.setLongitude(90.3680);
        worker3.setAddress("Section 10, Mirpur, Dhaka");
        worker3.setProfilePicture("https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop");
        userRepository.save(worker3);

        WorkerProfile profile3 = new WorkerProfile(worker3, "House Painting, Carpentry", 3, "Mirpur, Mohammadpur", "Silver", 350.0);
        profile3.setLatitude(23.8050);
        profile3.setLongitude(90.3680);
        workerProfileRepository.save(profile3);

        VerificationRequest req1 = new VerificationRequest(worker3, "19972618954712999", 
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300", 
            "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300");
        verificationRequestRepository.save(req1);

        // Worker 4: Tariqul Islam (AC Repair Specialist - Uttara Sector 13 ~350m)
        User worker4 = new User("Tariqul Islam", "tariq@gmail.com", "01712345678", "WORKER");
        worker4.setVerified(true);
        worker4.setRating(4.9);
        worker4.setLatitude(23.8745);
        worker4.setLongitude(90.3815);
        worker4.setAddress("Sector 13, Uttara, Dhaka");
        worker4.setProfilePicture("https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop");
        userRepository.save(worker4);

        WorkerProfile profile4 = new WorkerProfile(worker4, "AC Repair, HVAC Servicing, Refrigerant Gas Top-up", 8, "Uttara, Tongi, Airport", "Master", 550.0);
        profile4.setLatitude(23.8745);
        profile4.setLongitude(90.3815);
        workerProfileRepository.save(profile4);

        // Worker 5: Tanvir Ahmed (Electrical & Smart Home - Uttara Sector 3 ~1.5km)
        User worker5 = new User("Tanvir Ahmed", "tanvir@gmail.com", "01823456789", "WORKER");
        worker5.setVerified(true);
        worker5.setRating(4.7);
        worker5.setLatitude(23.8680);
        worker5.setLongitude(90.3910);
        worker5.setAddress("Sector 3, Uttara, Dhaka");
        worker5.setProfilePicture("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop");
        userRepository.save(worker5);

        WorkerProfile profile5 = new WorkerProfile(worker5, "Electrical, Smart Home Automation, Generator Repair", 5, "Uttara North & Airport Road", "Gold", 400.0);
        profile5.setLatitude(23.8680);
        profile5.setLongitude(90.3910);
        workerProfileRepository.save(profile5);

        // Worker 6: Mahfuzur Rahman (Plumbing & Water Pump Specialist - Gulshan 2)
        User worker6 = new User("Mahfuzur Rahman", "mahfuz@gmail.com", "01934567890", "WORKER");
        worker6.setVerified(true);
        worker6.setRating(4.85);
        worker6.setLatitude(23.7925);
        worker6.setLongitude(90.4078);
        worker6.setAddress("Road 71, Gulshan 2, Dhaka");
        worker6.setProfilePicture("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop");
        userRepository.save(worker6);

        WorkerProfile profile6 = new WorkerProfile(worker6, "Plumbing, Water Pump Repair, Gas Line Fitting", 9, "Gulshan, Banani, Baridhara", "Platinum", 500.0);
        profile6.setLatitude(23.7925);
        profile6.setLongitude(90.4078);
        workerProfileRepository.save(profile6);

        // Worker 7: Kazi Kabir (House Painting & Interior Finishing - Mirpur 11)
        User worker7 = new User("Kazi Kabir", "kabir@gmail.com", "01545678901", "WORKER");
        worker7.setVerified(true);
        worker7.setRating(4.6);
        worker7.setLatitude(23.8150);
        worker7.setLongitude(90.3650);
        worker7.setAddress("Section 11, Mirpur, Dhaka");
        worker7.setProfilePicture("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop");
        userRepository.save(worker7);

        WorkerProfile profile7 = new WorkerProfile(worker7, "House Painting, Wood Polish, Carpentry", 4, "Mirpur & Cantonment", "Silver", 350.0);
        profile7.setLatitude(23.8150);
        profile7.setLongitude(90.3650);
        workerProfileRepository.save(profile7);

        // Worker 8: Shahriar Hossain (AC & Electrical Appliances - Banani)
        User worker8 = new User("Shahriar Hossain", "shahriar@gmail.com", "01656789012", "WORKER");
        worker8.setVerified(true);
        worker8.setRating(4.95);
        worker8.setLatitude(23.7930);
        worker8.setLongitude(90.4040);
        worker8.setAddress("Block E, Banani, Dhaka");
        worker8.setProfilePicture("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop");
        userRepository.save(worker8);

        WorkerProfile profile8 = new WorkerProfile(worker8, "AC Repair, Washing Machine Repair, Microwave Repair", 7, "Banani, Mohakhali, Tejgaon", "Platinum", 480.0);
        profile8.setLatitude(23.7930);
        profile8.setLongitude(90.4040);
        workerProfileRepository.save(profile8);

        // Worker 9: Farhan Ahmed (Washing Machine & Refrigerator Specialist - Bashundhara R/A)
        User worker9 = new User("Farhan Ahmed", "farhan@gmail.com", "01722334455", "WORKER");
        worker9.setVerified(true);
        worker9.setRating(4.88);
        worker9.setLatitude(23.8155);
        worker9.setLongitude(90.4250);
        worker9.setAddress("Block C, Bashundhara R/A, Dhaka");
        worker9.setProfilePicture("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop");
        userRepository.save(worker9);

        WorkerProfile profile9 = new WorkerProfile(worker9, "Washing Machine Repair, Refrigerator Gas Top-up, Inverter PCB", 8, "Bashundhara, Baridhara, Kuril", "Master", 520.0);
        profile9.setLatitude(23.8155);
        profile9.setLongitude(90.4250);
        workerProfileRepository.save(profile9);

        // Worker 10: Imtiaz Chowdhury (Master Electrician & CCTV Specialist - Badda)
        User worker10 = new User("Imtiaz Chowdhury", "imtiaz@gmail.com", "01833445566", "WORKER");
        worker10.setVerified(true);
        worker10.setRating(4.75);
        worker10.setLatitude(23.7850);
        worker10.setLongitude(90.4270);
        worker10.setAddress("Middle Badda, Dhaka");
        worker10.setProfilePicture("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop");
        userRepository.save(worker10);

        WorkerProfile profile10 = new WorkerProfile(worker10, "Electrical, CCTV Camera Installation, IPS & UPS Repair", 6, "Badda, Rampura, Khilgaon", "Gold", 420.0);
        profile10.setLatitude(23.7850);
        profile10.setLongitude(90.4270);
        workerProfileRepository.save(profile10);

        // Worker 11: Zubaer Rahman (Gas Stove & Water Purifier Technician - Mohammadpur)
        User worker11 = new User("Zubaer Rahman", "zubaer@gmail.com", "01944556677", "WORKER");
        worker11.setVerified(true);
        worker11.setRating(4.82);
        worker11.setLatitude(23.7590);
        worker11.setLongitude(90.3620);
        worker11.setAddress("Kazi Nazrul Islam Road, Mohammadpur, Dhaka");
        worker11.setProfilePicture("https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop");
        userRepository.save(worker11);

        WorkerProfile profile11 = new WorkerProfile(worker11, "Gas Stove Burner Fitting, RO Water Purifier Servicing, Kitchen Geyser", 5, "Mohammadpur, Dhanmondi, Lalmatia", "Gold", 400.0);
        profile11.setLatitude(23.7590);
        profile11.setLongitude(90.3620);
        workerProfileRepository.save(profile11);

        // Worker 12: Ariful Islam (House Cleaning & Water Tank Cleaning Specialist - Khilgaon)
        User worker12 = new User("Ariful Islam", "arif@gmail.com", "01555667788", "WORKER");
        worker12.setVerified(true);
        worker12.setRating(4.90);
        worker12.setLatitude(23.7520);
        worker12.setLongitude(90.4210);
        worker12.setAddress("Tamtola, Khilgaon, Dhaka");
        worker12.setProfilePicture("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop");
        userRepository.save(worker12);

        WorkerProfile profile12 = new WorkerProfile(worker12, "Deep House Cleaning, Overhead Water Tank Jet Wash, Sofa Cleaning", 7, "Khilgaon, Malibagh, Basabo", "Platinum", 380.0);
        profile12.setLatitude(23.7520);
        profile12.setLongitude(90.4210);
        workerProfileRepository.save(profile12);

        // Worker 13: Hasan Mahmud (Roof Waterproofing & Masonry Repair - Old Dhaka / Lalbagh)
        User worker13 = new User("Hasan Mahmud", "hasan@gmail.com", "01666778899", "WORKER");
        worker13.setVerified(true);
        worker13.setRating(4.70);
        worker13.setLatitude(23.7180);
        worker13.setLongitude(90.3880);
        worker13.setAddress("Lalbagh Fort Road, Old Dhaka, Dhaka");
        worker13.setProfilePicture("https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop");
        userRepository.save(worker13);

        WorkerProfile profile13 = new WorkerProfile(worker13, "Roof Damp Leak Proofing, Tile Fitting, Masonry Work", 11, "Old Dhaka, Lalbagh, Motijheel, Sadarghat", "Master", 450.0);
        profile13.setLatitude(23.7180);
        profile13.setLongitude(90.3880);
        workerProfileRepository.save(profile13);

        // Worker 14: Nazmul Huda (AC & Chiller Specialist - Tongi / Uttara Extension)
        User worker14 = new User("Nazmul Huda", "nazmul@gmail.com", "01777889900", "WORKER");
        worker14.setVerified(true);
        worker14.setRating(4.92);
        worker14.setLatitude(23.8920);
        worker14.setLongitude(90.3950);
        worker14.setAddress("Sector 18, Uttara, Dhaka");
        worker14.setProfilePicture("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop");
        userRepository.save(worker14);

        WorkerProfile profile14 = new WorkerProfile(worker14, "AC Repair, Inverter Compressor Replacement, Gas Top-up", 9, "Uttara, Tongi, Gazipur", "Platinum", 550.0);
        profile14.setLatitude(23.8920);
        profile14.setLongitude(90.3950);
        workerProfileRepository.save(profile14);

        // Worker 15: Biplob Hossain (Sanitary Fitting & Sewer Line Unclogging - Mirpur 2)
        User worker15 = new User("Biplob Hossain", "biplob@gmail.com", "01888990011", "WORKER");
        worker15.setVerified(true);
        worker15.setRating(4.80);
        worker15.setLatitude(23.8080);
        worker15.setLongitude(90.3610);
        worker15.setAddress("Stadium Road, Mirpur 2, Dhaka");
        worker15.setProfilePicture("https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop");
        userRepository.save(worker15);

        WorkerProfile profile15 = new WorkerProfile(worker15, "Plumbing, Sewer Line Unclogging, High Pressure Drain Wash", 8, "Mirpur, Pallabi, Kafrul", "Gold", 460.0);
        profile15.setLatitude(23.8080);
        profile15.setLongitude(90.3610);
        workerProfileRepository.save(profile15);

        // Pre-populate bookings
        ServiceBooking booking1 = new ServiceBooking(customer, worker1, "AC Repair & Servicing", LocalDateTime.now().plusDays(1), 1500.0, "AC unit not cooling effectively and makes noise.");
        booking1.setStartVerificationCode("4829");
        booking1.setCompletionVerificationCode("9143");
        booking1.setLiveLocation("23.8103, 90.4125");
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
