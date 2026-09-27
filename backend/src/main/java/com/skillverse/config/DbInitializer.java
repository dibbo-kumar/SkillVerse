package com.skillverse.config;

import com.skillverse.model.*;
import com.skillverse.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class DbInitializer implements CommandLineRunner {

        private final UserRepository userRepository;
        private final WorkerProfileRepository workerProfileRepository;
        private final ServiceBookingRepository bookingRepository;
        private final CourseRepository courseRepository;
        private final CourseLessonRepository lessonRepository;
        private final CourseEnrollmentRepository enrollmentRepository;
        private final MarketplaceItemRepository marketplaceRepository;
        private final VerificationRequestRepository verificationRequestRepository;
        private final ToolStoreProductRepository toolStoreProductRepository;
        private final StoreCategoryRepository storeCategoryRepository;
        private final StoreOrderRepository storeOrderRepository;
        private final ProductReviewRepository productReviewRepository;
        private final ProblemPostRepository problemPostRepository;
        private final ProblemOfferRepository problemOfferRepository;

        public DbInitializer(UserRepository userRepository, WorkerProfileRepository workerProfileRepository,
                        ServiceBookingRepository bookingRepository, CourseRepository courseRepository,
                        CourseLessonRepository lessonRepository, CourseEnrollmentRepository enrollmentRepository,
                        MarketplaceItemRepository marketplaceRepository,
                        VerificationRequestRepository verificationRequestRepository,
                        ToolStoreProductRepository toolStoreProductRepository,
                        StoreCategoryRepository storeCategoryRepository,
                        StoreOrderRepository storeOrderRepository,
                        ProductReviewRepository productReviewRepository,
                        ProblemPostRepository problemPostRepository,
                        ProblemOfferRepository problemOfferRepository) {
                this.userRepository = userRepository;
                this.workerProfileRepository = workerProfileRepository;
                this.bookingRepository = bookingRepository;
                this.courseRepository = courseRepository;
                this.lessonRepository = lessonRepository;
                this.enrollmentRepository = enrollmentRepository;
                this.marketplaceRepository = marketplaceRepository;
                this.verificationRequestRepository = verificationRequestRepository;
                this.toolStoreProductRepository = toolStoreProductRepository;
                this.storeCategoryRepository = storeCategoryRepository;
                this.storeOrderRepository = storeOrderRepository;
                this.productReviewRepository = productReviewRepository;
                this.problemPostRepository = problemPostRepository;
                this.problemOfferRepository = problemOfferRepository;
        }

        @Override
        public void run(String... args) throws Exception {
                if (userRepository.count() == 0) {
                        seedCoreData();
                }
                if (verificationRequestRepository.count() == 0) {
                        seedVerificationData();
                }
                if (problemPostRepository.count() == 0) {
                        seedProblemPosts();
                }
                if (storeCategoryRepository.count() == 0) {
                        seedToolStoreData();
                }
        }

        private void seedVerificationData() {
                User worker1 = userRepository.findByEmail("kamrul@gmail.com").orElse(null);
                if (worker1 != null) {
                        VerificationRequest v1 = new VerificationRequest();
                        v1.setUser(worker1);
                        v1.setFullName("Kamrul Islam");
                        v1.setDateOfBirth("1994-08-14");
                        v1.setPhone(worker1.getPhone());
                        v1.setPhoneVerified(true);
                        v1.setNidNumber("19942618954712365");
                        v1.setNidFrontPhoto("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600");
                        v1.setNidBackPhoto("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600");
                        v1.setProfileSelfiePhoto(worker1.getProfilePicture());
                        v1.setPresentAddress("Sector 11, Road 3, House 24, Uttara, Dhaka");
                        v1.setPermanentAddress("Vill: Sonapur, PS: Begumganj, Dist: Noakhali");
                        v1.setDivision("Dhaka");
                        v1.setDistrict("Dhaka");
                        v1.setCityArea("Uttara");
                        v1.setPostalCode("1230");
                        v1.setDetailedAddress("Sector 11, Road 3, House 24, Uttara, Dhaka");
                        v1.setSkills("Electrical, AC Repair, Smart Home");
                        v1.setExperienceYears(6);
                        v1.setExperienceDescription("Expert in inverter split AC installation, copper brazing, and 3-phase commercial wiring.");
                        v1.setPreviousEmployer("Electra Bangladesh Ltd");
                        v1.setExperienceCertPhoto("https://images.unsplash.com/photo-1589330694653-dad6ef0190b8?w=600");
                        v1.setWorkProofPhoto("https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600");
                        v1.setPayoutMethod("bKash");
                        v1.setPayoutAccount(worker1.getPhone());
                        v1.setPayoutAccountHolder("Kamrul Islam");
                        v1.setStatus("APPROVED");
                        v1.setSubmittedAt(LocalDateTime.now().minusDays(15));
                        v1.setReviewedAt(LocalDateTime.now().minusDays(14));
                        verificationRequestRepository.save(v1);
                }

                User worker2 = userRepository.findByEmail("rafiq@gmail.com").orElse(null);
                if (worker2 != null) {
                        VerificationRequest v2 = new VerificationRequest();
                        v2.setUser(worker2);
                        v2.setFullName("Mohammad Rafiq");
                        v2.setDateOfBirth("1989-03-22");
                        v2.setPhone(worker2.getPhone());
                        v2.setPhoneVerified(true);
                        v2.setNidNumber("19892618954785412");
                        v2.setNidFrontPhoto("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600");
                        v2.setNidBackPhoto("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600");
                        v2.setProfileSelfiePhoto(worker2.getProfilePicture());
                        v2.setPresentAddress("Road 9A, House 12, Dhanmondi, Dhaka");
                        v2.setPermanentAddress("Vill: Charsindur, PS: Palash, Dist: Narsingdi");
                        v2.setDivision("Dhaka");
                        v2.setDistrict("Dhaka");
                        v2.setCityArea("Dhanmondi");
                        v2.setPostalCode("1209");
                        v2.setDetailedAddress("Road 9A, House 12, Dhanmondi, Dhaka");
                        v2.setSkills("Plumbing, Water Pump Repair");
                        v2.setExperienceYears(10);
                        v2.setExperienceDescription("Specialized in concealed acoustic leak detection, PPR pipe heat fusion, and high-pressure pumps.");
                        v2.setPreviousEmployer("Aqua Plumbing Solutions");
                        v2.setWorkProofPhoto("https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600");
                        v2.setPayoutMethod("Nagad");
                        v2.setPayoutAccount(worker2.getPhone());
                        v2.setPayoutAccountHolder("Mohammad Rafiq");
                        v2.setStatus("APPROVED");
                        v2.setSubmittedAt(LocalDateTime.now().minusDays(20));
                        v2.setReviewedAt(LocalDateTime.now().minusDays(19));
                        verificationRequestRepository.save(v2);
                }

                // Seed Demo Candidate 3: Tanvir Alam (PENDING / UNDER REVIEW)
                User worker3 = userRepository.findByEmail("tanvir@gmail.com").orElse(null);
                if (worker3 == null) {
                        worker3 = new User("Tanvir Alam", "tanvir@gmail.com", "01733445566", "WORKER");
                        worker3.setVerified(false);
                        worker3.setStatus("UNDER_REVIEW");
                        worker3.setNidNumber("19962618954734891");
                        worker3.setRating(5.0);
                        worker3.setLatitude(23.8041);
                        worker3.setLongitude(90.3667);
                        worker3.setAddress("House 22, Road 7, Mirpur 10, Dhaka");
                        worker3.setProfilePicture("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop");
                        worker3 = userRepository.save(worker3);

                        WorkerProfile profile3 = new WorkerProfile(worker3, "AC Repair & Servicing, Electrical", 4,
                                        "Dhaka West (Mirpur, Kallyanpur, Mohammadpur)", "Silver", 400.0);
                        profile3.setLatitude(23.8041);
                        profile3.setLongitude(90.3667);
                        workerProfileRepository.save(profile3);

                        VerificationRequest v3 = new VerificationRequest();
                        v3.setUser(worker3);
                        v3.setFullName("Tanvir Alam");
                        v3.setDateOfBirth("1996-05-12");
                        v3.setPhone(worker3.getPhone());
                        v3.setPhoneVerified(true);
                        v3.setNidNumber("19962618954734891");
                        v3.setNidFrontPhoto("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600");
                        v3.setNidBackPhoto("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600");
                        v3.setProfileSelfiePhoto(worker3.getProfilePicture());
                        v3.setPresentAddress("House 22, Road 7, Mirpur 10, Dhaka");
                        v3.setPermanentAddress("Vill: Joypur, PS: Kotwali, Dist: Cumilla");
                        v3.setDivision("Dhaka");
                        v3.setDistrict("Dhaka");
                        v3.setCityArea("Mirpur");
                        v3.setPostalCode("1216");
                        v3.setDetailedAddress("House 22, Road 7, Mirpur 10, Dhaka");
                        v3.setSkills("AC Repair & Servicing, Electrical");
                        v3.setExperienceYears(4);
                        v3.setExperienceDescription("4 years experience in commercial HVAC units, split AC gas charging, and capacitor testing.");
                        v3.setPreviousEmployer("Cooling Star Service Point");
                        v3.setExperienceCertPhoto("https://images.unsplash.com/photo-1589330694653-dad6ef0190b8?w=600");
                        v3.setTrainingCertPhoto("https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600");
                        v3.setWorkProofPhoto("https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=600");
                        v3.setPayoutMethod("bKash");
                        v3.setPayoutAccount("01733445566");
                        v3.setPayoutAccountHolder("Tanvir Alam");
                        v3.setStatus("PENDING");
                        v3.setSubmittedAt(LocalDateTime.now().minusHours(3));
                        verificationRequestRepository.save(v3);
                }

                // Seed Demo Candidate 4: Jahangir Kabir (CORRECTION_REQUIRED)
                User worker4 = userRepository.findByEmail("jahangir@gmail.com").orElse(null);
                if (worker4 == null) {
                        worker4 = new User("Jahangir Kabir", "jahangir@gmail.com", "01622334455", "WORKER");
                        worker4.setVerified(false);
                        worker4.setStatus("CORRECTION_REQUIRED");
                        worker4.setNidNumber("19912618954790123");
                        worker4.setRating(5.0);
                        worker4.setLatitude(23.7500);
                        worker4.setLongitude(90.3900);
                        worker4.setAddress("Green Road, Farmgate, Dhaka");
                        worker4.setProfilePicture("https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop");
                        worker4 = userRepository.save(worker4);

                        WorkerProfile profile4 = new WorkerProfile(worker4, "Electrical, Generator Repair", 5,
                                        "Dhaka Central (Farmgate, Tejgaon, Kawran Bazar)", "Silver", 420.0);
                        profile4.setLatitude(23.7500);
                        profile4.setLongitude(90.3900);
                        workerProfileRepository.save(profile4);

                        VerificationRequest v4 = new VerificationRequest();
                        v4.setUser(worker4);
                        v4.setFullName("Jahangir Kabir");
                        v4.setDateOfBirth("1991-11-05");
                        v4.setPhone(worker4.getPhone());
                        v4.setPhoneVerified(true);
                        v4.setNidNumber("19912618954790123");
                        v4.setNidFrontPhoto("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600");
                        v4.setNidBackPhoto("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600");
                        v4.setProfileSelfiePhoto(worker4.getProfilePicture());
                        v4.setPresentAddress("Green Road, Farmgate, Dhaka");
                        v4.setPermanentAddress("Vill: Rampur, PS: Bancharampur, Dist: Brahmanbaria");
                        v4.setDivision("Dhaka");
                        v4.setDistrict("Dhaka");
                        v4.setCityArea("Farmgate");
                        v4.setPostalCode("1215");
                        v4.setDetailedAddress("Green Road, 2nd Floor, Farmgate, Dhaka");
                        v4.setSkills("Electrical, Generator Repair");
                        v4.setExperienceYears(5);
                        v4.setExperienceDescription("Specialist in distribution board installation, MCB breakers, and industrial generators.");
                        v4.setPreviousEmployer("Dhaka Power Tech");
                        v4.setPayoutMethod("Bank Account");
                        v4.setPayoutAccount("2050123456789012");
                        v4.setPayoutAccountHolder("Jahangir Kabir");
                        v4.setPayoutBankName("Islami Bank Bangladesh Ltd");
                        v4.setPayoutBankBranch("Farmgate Branch");
                        v4.setStatus("CORRECTION_REQUIRED");
                        v4.setAdminRemarks("NID back photo is blurred and unreadable. Please upload a clear photo showing the barcode and issue date.");
                        v4.setSubmittedAt(LocalDateTime.now().minusDays(1));
                        v4.setReviewedAt(LocalDateTime.now().minusHours(5));
                        verificationRequestRepository.save(v4);
                }
        }

        private void seedProblemPosts() {
                List<User> customers = userRepository.findAll().stream()
                                .filter(u -> "CUSTOMER".equalsIgnoreCase(u.getRole()))
                                .toList();
                List<User> workers = userRepository.findAll().stream()
                                .filter(u -> "WORKER".equalsIgnoreCase(u.getRole()))
                                .toList();

                if (customers.isEmpty() || workers.size() < 2) return;

                User customer = customers.get(0);
                User worker1 = workers.get(0);
                User worker2 = workers.get(1);

                ProblemPost prob1 = new ProblemPost();
                prob1.setCustomer(customer);
                prob1.setServiceCategory("AC Repair & Servicing");
                prob1.setTitle("Emergency AC Gas Leak & Inverter Cooling Issue");
                prob1.setDescription("Our 1.5 ton General split AC is blowing normal room temperature air. Error code E4 visible on display.");
                prob1.setApplianceInfo("General Inverter 1.5 Ton Split AC");
                prob1.setPhotoUrl("https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=600");
                prob1.setPreferredDate("Tomorrow");
                prob1.setPreferredTime("10:00 AM - 12:00 PM");
                prob1.setAddress(customer.getAddress() != null ? customer.getAddress() : "House 14, Road 4, Sector 12, Uttara, Dhaka");
                prob1.setBudgetPrice(1200.0);
                prob1.setStatus("OPEN");
                ProblemPost savedProb1 = problemPostRepository.save(prob1);

                ProblemOffer off1 = new ProblemOffer(savedProb1, worker2, 1100.0,
                                "Mohammad Rafiq here. Specialized in AC leakage pressure test and vacuum charging. Available tomorrow at 10 AM.",
                                "Within 45 mins");
                problemOfferRepository.save(off1);

                ProblemOffer off2 = new ProblemOffer(savedProb1, worker1, 1250.0,
                                "Kamrul Islam here. Certified HVAC technician with complete digital manifold gauge and genuine R32/R410 gas canisters.",
                                "Within 1-2 hours");
                problemOfferRepository.save(off2);
        }

        private void seedWorker(String name, String email, String phone, String nid, double rating, double lat, double lon,
                                String serviceArea, String skills, int expYears, String level, double rate, double basePrice, String photoUrl) {
                User worker = userRepository.findByEmail(email).orElse(null);
                if (worker == null) {
                        worker = new User(name, email, phone, "WORKER");
                        worker.setVerified(true);
                        worker.setNidNumber(nid);
                        worker.setRating(rating);
                        worker.setLatitude(lat);
                        worker.setLongitude(lon);
                        worker.setAddress(serviceArea);
                        worker.setProfilePicture(photoUrl);
                        worker = userRepository.save(worker);
                } else {
                        worker.setVerified(true);
                        worker.setLatitude(lat);
                        worker.setLongitude(lon);
                        worker.setAddress(serviceArea);
                        userRepository.save(worker);
                }

                WorkerProfile profile = workerProfileRepository.findByUserId(worker.getId()).orElse(null);
                if (profile == null) {
                        profile = new WorkerProfile(worker, skills, expYears, serviceArea, level, rate, basePrice);
                        profile.setLatitude(lat);
                        profile.setLongitude(lon);
                        workerProfileRepository.save(profile);
                } else {
                        profile.setLatitude(lat);
                        profile.setLongitude(lon);
                        profile.setServiceArea(serviceArea);
                        profile.setSkills(skills);
                        workerProfileRepository.save(profile);
                }
        }

        private void seedCoreData() {

                // Pre-populate users
                User admin = new User("System Admin", "admin@skillverse.com", "01711122233", "ADMIN");
                admin.setVerified(true);
                userRepository.save(admin);

                User customer = new User("Anisur Rahman", "anis@gmail.com", "01811223344", "CUSTOMER");
                customer.setVerified(true);
                customer.setLatitude(23.8759);
                customer.setLongitude(90.3795);
                customer.setAddress("House 14, Road 4, Sector 12, Uttara, Dhaka");
                customer.setProfilePicture(
                                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop");
                userRepository.save(customer);

                // Pre-populate workers
                seedWorker("Kamrul Islam", "kamrul@gmail.com", "01911223344", "19942618954712365", 4.8, 23.8720, 90.3810,
                        "Sector 11, Uttara, Dhaka", "Electrical, AC Repair, Smart Home", 6, "Gold", 450.0, 300.0,
                        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&auto=format&fit=crop");

                seedWorker("Mohammad Rafiq", "rafiq@gmail.com", "01511223344", "19892618954785412", 4.9, 23.7461, 90.3742,
                        "Road 9A, Dhanmondi, Dhaka", "Plumbing, Water Pump Repair", 10, "Master", 500.0, 350.0,
                        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&auto=format&fit=crop");

                seedWorker("Tariqul Islam", "tariq@gmail.com", "01712345678", "19882618954711223", 4.9, 23.8745, 90.3815,
                        "Sector 13, Uttara, Dhaka", "AC Repair, HVAC Servicing, Refrigerant Gas Top-up", 8, "Master", 550.0, 400.0,
                        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop");

                seedWorker("Tanvir Ahmed", "tanvir.ahmed@gmail.com", "01823456789", "19922618954733445", 4.7, 23.8680, 90.3910,
                        "Sector 3, Uttara, Dhaka", "Electrical, Smart Home Automation, Generator Repair", 5, "Gold", 400.0, 300.0,
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop");

                seedWorker("Mahfuzur Rahman", "mahfuz@gmail.com", "01934567890", "19872618954755667", 4.85, 23.7925, 90.4078,
                        "Road 71, Gulshan 2, Dhaka", "Plumbing, Water Pump Repair, Gas Line Fitting", 9, "Platinum", 500.0, 350.0,
                        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop");

                seedWorker("Kazi Kabir", "kabir@gmail.com", "01545678901", "19952618954777889", 4.6, 23.8150, 90.3650,
                        "Section 11, Mirpur, Dhaka", "House Painting, Wood Polish, Carpentry", 4, "Silver", 350.0, 250.0,
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop");

                seedWorker("Shahriar Hossain", "shahriar@gmail.com", "01656789012", "19902618954799001", 4.95, 23.7930, 90.4040,
                        "Block E, Banani, Dhaka", "AC Repair, Washing Machine Repair, Microwave Repair", 7, "Platinum", 480.0, 300.0,
                        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop");

                seedWorker("Farhan Ahmed", "farhan@gmail.com", "01722334455", "19892618954722334", 4.88, 23.8155, 90.4250,
                        "Block C, Bashundhara R/A, Dhaka", "Washing Machine Repair, Refrigerator Gas Top-up, PCB Repair", 8, "Master", 520.0, 350.0,
                        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop");

                seedWorker("Imtiaz Chowdhury", "imtiaz@gmail.com", "01833445566", "19932618954744556", 4.75, 23.7850, 90.4270,
                        "Middle Badda, Dhaka", "Electrical, CCTV Camera Installation, IPS & UPS Repair", 6, "Gold", 420.0, 300.0,
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop");

                seedWorker("Zubaer Rahman", "zubaer@gmail.com", "01944556677", "19912618954766778", 4.82, 23.7590, 90.3620,
                        "Kazi Nazrul Islam Road, Mohammadpur, Dhaka", "Gas Stove Burner Fitting, RO Water Purifier Servicing, Kitchen Geyser", 5, "Gold", 400.0, 250.0,
                        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop");

                seedWorker("Ariful Islam", "arif@gmail.com", "01555667788", "19902618954788990", 4.90, 23.7520, 90.4210,
                        "Tamtola, Khilgaon, Dhaka", "Deep House Cleaning, Overhead Water Tank Jet Wash, Sofa Cleaning", 7, "Platinum", 380.0, 250.0,
                        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop");

                seedWorker("Hasan Mahmud", "hasan@gmail.com", "01666778899", "19852618954700112", 4.70, 23.7180, 90.3880,
                        "Lalbagh Fort Road, Old Dhaka, Dhaka", "Roof Damp Leak Proofing, Tile Fitting, Masonry Work", 11, "Master", 450.0, 300.0,
                        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop");

                seedWorker("Nazmul Huda", "nazmul@gmail.com", "01777889900", "19882618954733221", 4.92, 23.8920, 90.3950,
                        "Sector 18, Uttara, Dhaka", "AC Repair, Inverter Compressor Replacement, Gas Top-up", 9, "Platinum", 550.0, 400.0,
                        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop");

                seedWorker("Sajid Hasan", "sajid@gmail.com", "01755667788", "19952618954712399", 4.85, 23.8730, 90.3820,
                        "Sector 12, Uttara, Dhaka", "Electrical, AC Repair, Home Automation", 5, "Gold", 420.0, 300.0,
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop");

                seedWorker("Biplob Hossain", "biplob@gmail.com", "01888990011", "19922618954755443", 4.80, 23.8080, 90.3610,
                        "Stadium Road, Mirpur 2, Dhaka", "Plumbing, Sewer Line Unclogging, High Pressure Drain Wash", 8, "Gold", 460.0, 300.0,
                        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop");

                User worker1 = userRepository.findByEmail("kamrul@gmail.com").orElse(null);
                User worker2 = userRepository.findByEmail("rafiq@gmail.com").orElse(null);

                // Pre-populate bookings with past completed review
                ServiceBooking bookingPast1 = new ServiceBooking(customer, worker1, "Electrical Circuit Diagnostic",
                                LocalDateTime.now().minusDays(5), 1200.0,
                                "Main DB circuit breaker tripped and kitchen socket replaced.");
                bookingPast1.setStatus("COMPLETED");
                bookingPast1.setPaymentStatus("PAID");
                bookingPast1.setAgreedCost(1200.0);
                bookingPast1.setBasePrice(300.0);
                bookingPast1.setAdvancePaid(true);
                bookingPast1.setAdvancePaidAmount(300.0);
                bookingPast1.setAdvanceVatAmount(15.0);
                bookingPast1.setReviewRating(5);
                bookingPast1.setReviewComment("Kamrul bhai is exceptionally skilled and punctual! Fixed the wiring issue within 40 mins.");
                bookingPast1.setReviewedAt(LocalDateTime.now().minusDays(4));
                bookingRepository.save(bookingPast1);

                ServiceBooking booking1 = new ServiceBooking(customer, worker1, "AC Repair & Servicing",
                                LocalDateTime.now().plusDays(1), 1500.0,
                                "AC unit not cooling effectively and makes noise.");
                booking1.setBasePrice(300.0);
                booking1.setStartVerificationCode("4829");
                booking1.setCompletionVerificationCode("9143");
                booking1.setLiveLocation("23.8103, 90.4125");
                bookingRepository.save(booking1);

                // --- PRE-POPULATE POSTED PROBLEM & TECHNICIAN OFFERS ---
                ProblemPost prob1 = new ProblemPost();
                prob1.setCustomer(customer);
                prob1.setServiceCategory("AC Repair & Servicing");
                prob1.setTitle("Emergency AC Gas Leak & Inverter Cooling Issue");
                prob1.setDescription("Our 1.5 ton General split AC is blowing normal room temperature air. Error code E4 visible on display.");
                prob1.setApplianceInfo("General Inverter 1.5 Ton Split AC");
                prob1.setPhotoUrl("https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=600");
                prob1.setPreferredDate("Tomorrow");
                prob1.setPreferredTime("10:00 AM - 12:00 PM");
                prob1.setAddress(customer.getAddress());
                prob1.setBudgetPrice(1200.0);
                prob1.setStatus("OPEN");
                ProblemPost savedProb1 = problemPostRepository.save(prob1);

                ProblemOffer off1 = new ProblemOffer(savedProb1, worker2, 1100.0,
                                "Mohammad Rafiq here. Specialized in AC leakage pressure test and vacuum charging. Available tomorrow at 10 AM.",
                                "Within 45 mins");
                problemOfferRepository.save(off1);

                ProblemOffer off2 = new ProblemOffer(savedProb1, worker1, 1250.0,
                                "Kamrul Islam here. Certified HVAC technician with complete digital manifold gauge and genuine R32/R410 gas canisters.",
                                "Within 1-2 hours");
                problemOfferRepository.save(off2);
                Course c1 = new Course(
                                "Professional Workplace Communication",
                                "Learn essential communication techniques, client negotiation, crisis resolution, and professional presentation for modern technicians and service managers.",
                                "Farhana Yasmin",
                                "Communication",
                                "Beginner",
                                "6 hours",
                                6,
                                4.8,
                                1250,
                                false,
                                1500.0,
                                "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop");
                c1.setWhatYouWillLearn(
                                "✓ Understand professional communication\n✓ Communicate effectively with customers\n✓ Handle workplace conflicts\n✓ Write professional emails & digital quotes\n✓ Improve presentation & service etiquette");
                c1 = courseRepository.save(c1);

                Course c2 = new Course(
                                "Advanced HVAC & Inverter AC Servicing",
                                "Master modern inverter air conditioning installation, fault diagnosis, electronic PCB handling, and eco-friendly R410A gas recharging.",
                                "Md. Asaduzzaman (IEB Certified)",
                                "HVAC & AC",
                                "Intermediate",
                                "12 hours",
                                8,
                                4.9,
                                840,
                                false,
                                2500.0,
                                "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=600&auto=format&fit=crop");
                c2.setWhatYouWillLearn(
                                "✓ Diagnose inverter compressor error codes\n✓ Perform safe R410A & R32 refrigerant gas top-up\n✓ Handle electronic PCB control board troubleshooting\n✓ Perform high pressure chemical jet wash");
                c2 = courseRepository.save(c2);

                Course c3 = new Course(
                                "Home Electrical Safety & Grid Wiring",
                                "Learn national electrical code safety protocols, circuit breaker sizing, earthing installation, and digital multimeter troubleshooting.",
                                "Prof. Tasnim Ahmed (BUET)",
                                "Electrical",
                                "Beginner",
                                "4 hours",
                                5,
                                4.85,
                                2100,
                                true,
                                0.0,
                                "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop");
                c3.setWhatYouWillLearn(
                                "✓ Understand voltage, current, and resistance fundamentals\n✓ Operate digital multimeters safely without short circuits\n✓ Calculate MCB circuit breaker load capacity\n✓ Install proper copper rod ground earthing");
                c3 = courseRepository.save(c3);

                Course c4 = new Course(
                                "Concealed Plumbing & Acoustic Leak Detection",
                                "Master modern CPVC pipe joining, concealed leak acoustic location tools, pressure testing, and sanitary installation.",
                                "Engr. Rafiqul Islam",
                                "Plumbing",
                                "Advanced",
                                "8 hours",
                                6,
                                4.75,
                                620,
                                false,
                                1800.0,
                                "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop");
                c4.setWhatYouWillLearn(
                                "✓ Detect concealed behind-tile pipe leaks with acoustic sensors\n✓ Join CPVC & PPR heat-fusion pipes with zero leakage\n✓ Execute hydrostatic pressure testing\n✓ Install modern concealed shower valves & wall-hung toilets");
                c4 = courseRepository.save(c4);

                Course c5 = new Course(
                                "Smart Home Automation & IoT Sensor Setup",
                                "Learn wireless Smart Life & Zigbee switch pairing, smart door lock programming, ambient LED controller wiring, and voice assistant integration.",
                                "Engr. Tanvir Hossain",
                                "Smart Home",
                                "Intermediate",
                                "7 hours",
                                5,
                                4.9,
                                930,
                                false,
                                2200.0,
                                "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop");
                c5.setWhatYouWillLearn(
                                "✓ Wire smart relays & touch switches into existing gang boxes\n✓ Configure Zigbee 3.0 hubs & mesh range extenders\n✓ Program automated motion sensor light routines\n✓ Setup mobile remote security alerts");
                c5 = courseRepository.save(c5);

                Course c6 = new Course(
                                "Technician Workplace Safety & OSHA Standards",
                                "Essential hazard awareness, high voltage arc flash safety, ladder stability, chemical handling, and site emergency evacuation.",
                                "Capt. Mahmudul Hasan",
                                "Safety",
                                "Beginner",
                                "3 hours",
                                4,
                                4.95,
                                3400,
                                true,
                                0.0,
                                "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop");
                c6.setWhatYouWillLearn(
                                "✓ Identify workplace electrical & structural hazards\n✓ Wear PPE gear according to national safety standards\n✓ Execute emergency lockout/tagout (LOTO) procedures\n✓ Prevent high-altitude scaffold falls");
                c6 = courseRepository.save(c6);

                Course c7 = new Course(
                                "Commercial Painting & Wall Dampproofing",
                                "Master damp seal chemical application, wall putty sanding, airless spray painting, and decorative accent wall textures.",
                                "Md. Shah Alam",
                                "Painting",
                                "Beginner",
                                "5 hours",
                                5,
                                4.7,
                                510,
                                false,
                                1200.0,
                                "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop");
                c7.setWhatYouWillLearn(
                                "✓ Apply damp-proof barrier coatings to moisture damaged walls\n✓ Smooth wall surfaces using acrylic filler & putty\n✓ Operate commercial high-pressure airless paint sprayers\n✓ Create geometric & velvet wall finish textures");
                c7 = courseRepository.save(c7);

                Course c8 = new Course(
                                "Solar Panel Installation & Off-Grid Inverters",
                                "Design solar rooftop arrays, size lithium battery banks, wire MPPT charge controllers, and troubleshoot net metering solar systems.",
                                "Dr. Jahangir Kabir (REB)",
                                "Electrical",
                                "Advanced",
                                "10 hours",
                                6,
                                4.88,
                                1150,
                                false,
                                2800.0,
                                "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop");
                c8.setWhatYouWillLearn(
                                "✓ Calculate daily household kilowatt-hour power consumption\n✓ Mount rooftop solar racking at optimal sunlight tilt angles\n✓ Wire hybrid inverters & LiFePO4 battery storage\n✓ Perform DC isolator switch & surge protection wiring");
                c8 = courseRepository.save(c8);

                Course c9 = new Course(
                                "Refrigerator & Deep Freezer Sealed System Repair",
                                "Master compressor replacement, copper filter drier brazing, capillary tube clearing, and R600a eco-refrigerant charging.",
                                "Master Tech Tariqul Islam",
                                "HVAC & AC",
                                "Intermediate",
                                "9 hours",
                                6,
                                4.82,
                                760,
                                false,
                                2000.0,
                                "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop");
                c9.setWhatYouWillLearn(
                                "✓ Diagnose no-cooling complaints in single & double door fridges\n✓ Braze copper-to-copper & copper-to-steel joints safely\n✓ Vacuum sealed refrigeration loops to 300 microns\n✓ Charge exact R600a & R134a gas weight using digital scales");
                c9 = courseRepository.save(c9);

                Course c10 = new Course(
                                "Custom Carpentry & Modular Kitchen Cabinetry",
                                "Learn board cutting, PVC edge banding, concealed soft-close hinge alignment, and modular kitchen cabinet installation.",
                                "Usthad Babul Hossain",
                                "Carpentry",
                                "Intermediate",
                                "8 hours",
                                5,
                                4.78,
                                430,
                                false,
                                1600.0,
                                "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop");
                c10.setWhatYouWillLearn(
                                "✓ Read architectural furniture shop drawings accurately\n✓ Apply PVC heat edge banding for water resistant boards\n✓ Install hydraulic soft-close drawer slides & 3D hinges\n✓ Mount wall-hung kitchen cabinets securely with anchor bolts");
                c10 = courseRepository.save(c10);

                Course c11 = new Course(
                                "Diesel Generator & Automatic Transfer Switch (ATS)",
                                "Perform industrial generator oil servicing, radiator flushing, AVR voltage regulation adjustments, and 3-phase ATS panel wiring.",
                                "Engr. Nurul Huda",
                                "Electrical",
                                "Advanced",
                                "11 hours",
                                6,
                                4.91,
                                680,
                                false,
                                3000.0,
                                "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop");
                c11.setWhatYouWillLearn(
                                "✓ Execute 500-hour generator preventive maintenance tune-ups\n✓ Calibrate automatic voltage regulators (AVR) for steady 400V\n✓ Wire 3-phase automatic transfer switch (ATS) contactors\n✓ Diagnose fuel injector pump air locks");
                c11 = courseRepository.save(c11);

                Course c12 = new Course(
                                "CCTV Security Camera & NVR Network Setup",
                                "IP camera mounting, Cat6 RJ45 crimping, PoE switch power budget calculation, NVR hard drive installation, and remote mobile app viewing.",
                                "Ashraful Alam (Network Certified)",
                                "Smart Home",
                                "Beginner",
                                "5 hours",
                                5,
                                4.86,
                                1890,
                                true,
                                0.0,
                                "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop");
                c12.setWhatYouWillLearn(
                                "✓ Crimp T568B network cables with 100% test pass\n✓ Mount dome & bullet IP cameras with waterproof junction boxes\n✓ Configure NVR recording schedules & motion detection zones\n✓ Setup DDNS & P2P cloud viewing on Android & iPhone");
                c12 = courseRepository.save(c12);

                // --- PRE-POPULATE YOUTUBE EMBEDDED LESSONS FOR ALL COURSES ---
                // Using "Rick Astley - Never Gonna Give You Up (4K Remaster)" (Video ID:
                // dQw4w9WgXcQ)
                String demoVid = "dQw4w9WgXcQ";

                // Course 1 Lessons
                lessonRepository.save(new CourseLesson(c1.getId(), "Module 1 — Introduction to Professional Ethics",
                                "Lesson 1: Workplace Communication Fundamentals",
                                "Overview of customer satisfaction strategies and active listening skills.", demoVid,
                                "12:45", 1,
                                true));
                lessonRepository.save(new CourseLesson(c1.getId(), "Module 1 — Introduction to Professional Ethics",
                                "Lesson 2: Client Expectation Management",
                                "How to set realistic service timeframes and explain technical faults clearly.",
                                demoVid, "15:20", 2,
                                true));
                lessonRepository.save(new CourseLesson(c1.getId(), "Module 2 — Core Practical Skills",
                                "Lesson 3: De-escalating Customer Complaints",
                                "Practical scenarios for dealing with dissatisfied customers politely.", demoVid,
                                "18:10", 3, false));
                lessonRepository.save(new CourseLesson(c1.getId(), "Module 2 — Core Practical Skills",
                                "Lesson 4: Digital Invoicing & Service Summary",
                                "Generating digital quotes and obtaining customer completion verification.", demoVid,
                                "14:00", 4,
                                false));
                lessonRepository.save(new CourseLesson(c1.getId(), "Module 3 — Masterclass Topics",
                                "Lesson 5: Professional Hygiene & Safety Protocols",
                                "On-site clean-up standards and personal protection equipment.", demoVid, "10:30", 5,
                                false));
                lessonRepository.save(new CourseLesson(c1.getId(), "Module 3 — Masterclass Topics",
                                "Lesson 6: Final Evaluation & Exam Overview",
                                "Prepare for final certification quiz and practical field assessment.", demoVid,
                                "20:00", 6, false));

                // Course 2 Lessons
                lessonRepository.save(new CourseLesson(c2.getId(), "Module 1 — Inverter Technology Principles",
                                "Lesson 1: Inverter vs Non-Inverter Compressors",
                                "Understanding DC inverter variable speed motor control.", demoVid, "14:10", 1, true));
                lessonRepository.save(new CourseLesson(c2.getId(), "Module 1 — Inverter Technology Principles",
                                "Lesson 2: PCB Microcontroller Diagnostic Codes",
                                "Reading blink codes on outdoor unit control boards.",
                                demoVid, "16:45", 2, true));
                lessonRepository.save(new CourseLesson(c2.getId(), "Module 2 — Gas Charging & Leak Repair",
                                "Lesson 3: R410A & R32 High Pressure Gas Charging",
                                "Using manifold gauges and digital scales for eco refrigerant.", demoVid, "20:30", 3,
                                false));
                lessonRepository.save(new CourseLesson(c2.getId(), "Module 2 — Gas Charging & Leak Repair",
                                "Lesson 4: Chemical Jet Foam Wash Procedure",
                                "Step-by-step indoor coil cleaning without damaging blower motors.", demoVid, "15:50",
                                4, false));

                // Course 3 Lessons (Free Course)
                lessonRepository.save(new CourseLesson(c3.getId(), "Module 1 — Basic Electrical Concepts",
                                "Lesson 1: Understanding Voltage, Current & Resistance",
                                "Fundamental principles of electricity for home technicians.", demoVid, "10:15", 1,
                                true));
                lessonRepository.save(new CourseLesson(c3.getId(), "Module 1 — Basic Electrical Concepts",
                                "Lesson 2: Safety Gear & Multimeter Usage",
                                "How to use a digital multimeter without short circuiting.",
                                demoVid, "14:30", 2, true));
                lessonRepository.save(new CourseLesson(c3.getId(), "Module 2 — House Wiring Basics",
                                "Lesson 3: Distribution Board & Circuit Breakers",
                                "Understanding MCBs, RCCBs, and proper phase balancing.", demoVid, "22:00", 3, true));
                lessonRepository.save(
                                new CourseLesson(c3.getId(), "Module 2 — House Wiring Basics",
                                                "Lesson 4: Earthing & Shock Prevention",
                                                "Step by step earthing rod installation and resistance check.", demoVid,
                                                "16:45", 4, true));
                lessonRepository.save(
                                new CourseLesson(c3.getId(), "Module 3 — Summary",
                                                "Lesson 5: Emergency First Aid & Shock Response",
                                                "Crucial first-aid steps in case of electrical accidents.", demoVid,
                                                "11:20", 5, true));

                // Course 4 Lessons
                lessonRepository.save(new CourseLesson(c4.getId(), "Module 1 — Concealed Leak Detection",
                                "Lesson 1: Acoustic Sensor Operation Behind Tiles",
                                "Using ultrasonic listening devices to locate water wall leaks.", demoVid, "13:20", 1,
                                true));
                lessonRepository.save(new CourseLesson(c4.getId(), "Module 1 — Concealed Leak Detection",
                                "Lesson 2: CPVC Pipe Heat Fusion Joining",
                                "Proper heating temperature and socket depth for CPVC joints.", demoVid, "17:10", 2,
                                true));
                lessonRepository.save(
                                new CourseLesson(c4.getId(), "Module 2 — Hydrostatic Testing",
                                                "Lesson 3: High Pressure Pump Testing",
                                                "Testing pipeline integrity at 10 bar pressure before tiling.", demoVid,
                                                "19:00", 3, false));

                // Course 5 Lessons
                lessonRepository.save(new CourseLesson(c5.getId(), "Module 1 — Smart Relays",
                                "Lesson 1: Neutral vs Non-Neutral Switch Wiring",
                                "Wiring Tuya & Sonoff smart relays into standard electrical gang boxes.", demoVid,
                                "15:00", 1, true));
                lessonRepository.save(new CourseLesson(c5.getId(), "Module 2 — Zigbee Mesh Setup",
                                "Lesson 2: Zigbee 3.0 Gateway Pairing",
                                "Connecting wireless motion sensors & door contacts to Home Assistant.", demoVid,
                                "18:40", 2, false));

                // Course 6 Lessons (Free Safety Course)
                lessonRepository.save(new CourseLesson(c6.getId(), "Module 1 — Hazard Identification",
                                "Lesson 1: Arc Flash & High Voltage Risk Assessment",
                                "Understanding personal protective equipment (PPE) ratings.", demoVid, "11:30", 1,
                                true));
                lessonRepository.save(
                                new CourseLesson(c6.getId(), "Module 2 — LOTO Safety",
                                                "Lesson 2: Lockout / Tagout (LOTO) Procedures",
                                                "Securing power breakers during site service work.", demoVid, "14:15",
                                                2, true));

                // Course 7 Lessons
                lessonRepository.save(
                                new CourseLesson(c7.getId(), "Module 1 — Wall Preparation",
                                                "Lesson 1: Dampproof Barrier Application",
                                                "Sealing damp brick walls with waterproof acrylic polymer.", demoVid,
                                                "16:20", 1, true));

                // Course 8 Lessons
                lessonRepository.save(new CourseLesson(c8.getId(), "Module 1 — Solar PV Fundamentals",
                                "Lesson 1: Solar Panel Array Tilt Angle & Azimuth",
                                "Maximizing annual kilowatt-hour yield in South Asia.", demoVid, "21:00", 1, true));
                lessonRepository.save(new CourseLesson(c8.getId(), "Module 2 — Inverter Wiring",
                                "Lesson 2: Hybrid Inverter & LiFePO4 Battery Setup",
                                "Connecting solar panels, utility grid, and battery storage.", demoVid, "24:30", 2,
                                false));

                // Course 9 Lessons
                lessonRepository.save(new CourseLesson(c9.getId(), "Module 1 — Refrigeration Cycle",
                                "Lesson 1: Compressor Replacement & Brazing",
                                "Removing burnt out fridge compressors safely.", demoVid,
                                "18:15", 1, true));

                // Course 10 Lessons
                lessonRepository.save(new CourseLesson(c10.getId(), "Module 1 — Cabinetry Hardware",
                                "Lesson 1: Soft-Close Hinge & Slide Installation",
                                "Adjusting 3D cabinet hinges for perfectly aligned doors.", demoVid, "14:50", 1, true));

                // Course 11 Lessons
                lessonRepository.save(new CourseLesson(c11.getId(), "Module 1 — Diesel Engine Tune-Up",
                                "Lesson 1: Generator 500-Hour Service Routine",
                                "Changing oil filters, fuel filters, and bleeding fuel injectors.", demoVid, "22:10", 1,
                                true));

                // Course 12 Lessons (Free CCTV Course)
                lessonRepository.save(
                                new CourseLesson(c12.getId(), "Module 1 — IP Networking",
                                                "Lesson 1: Cat6 Cable Crimping & PoE Testing",
                                                "Crimping RJ45 connectors with standard T568B pinout.", demoVid,
                                                "12:00", 1, true));
                lessonRepository.save(
                                new CourseLesson(c12.getId(), "Module 2 — NVR Configuration",
                                                "Lesson 2: NVR Remote Cloud App Setup",
                                                "Pairing IP cameras to mobile smartphones via P2P cloud barcode.",
                                                demoVid, "16:30", 2, true));

                // --- PRE-POPULATE DEMO ENROLLMENTS ---
                // Customer Anisur enrolled in Course 3 (Free) and completed 3/5 lessons
                CourseEnrollment e1 = new CourseEnrollment(customer.getId(), c3.getId(), "FREE", "NONE", "TXN-FREE-001",
                                0.0);
                e1.setCompletedLessonsCount(3);
                e1.setProgressPercentage(60);
                e1.setIsCompleted(false);
                enrollmentRepository.save(e1);

                // Worker Kamrul enrolled in Course 1 (Paid) - SUCCESSFUL Payment
                CourseEnrollment e2 = new CourseEnrollment(worker1.getId(), c1.getId(), "SUCCESSFUL", "BKASH",
                                "BKASH-TXN-99812", 1500.0);
                e2.setCompletedLessonsCount(6);
                e2.setProgressPercentage(100);
                e2.setIsCompleted(true);
                e2.setCompletedAt(LocalDateTime.now().minusDays(2));
                enrollmentRepository.save(e2);

                System.out.println(">>> SkillVerse Core Database Pre-populated <<<");
        }

        private void seedToolStoreData() {
                User customer = userRepository.findByEmail("anis@gmail.com").orElse(null);
                User worker1 = userRepository.findByEmail("kamrul@gmail.com").orElse(null);
                StoreCategory cat1 = storeCategoryRepository.save(new StoreCategory("AC & Cooling", "ac-cooling",
                                "AC filters, capacitors, copper pipes, remotes & cleaning kits",
                                "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&auto=format&fit=crop"));
                StoreCategory cat2 = storeCategoryRepository.save(new StoreCategory("Refrigerator", "refrigerator",
                                "Thermostats, relays, capacitors, door gaskets & sensors",
                                "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=200&auto=format&fit=crop"));
                StoreCategory cat3 = storeCategoryRepository.save(new StoreCategory("Electrical", "electrical",
                                "Switches, circuit breakers, multimeters, wires & testers",
                                "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&auto=format&fit=crop"));
                StoreCategory cat4 = storeCategoryRepository.save(new StoreCategory("Plumbing", "plumbing",
                                "PVC pipes, teflon tapes, water taps, connectors & wrenches",
                                "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=200&auto=format&fit=crop"));
                StoreCategory cat5 = storeCategoryRepository.save(new StoreCategory("Fan", "fan",
                                "Fan capacitors, regulators, blades & motors",
                                "https://images.unsplash.com/photo-1618941709602-92849f611320?w=200&auto=format&fit=crop"));
                StoreCategory cat6 = storeCategoryRepository.save(new StoreCategory("Tools", "tools",
                                "Screwdriver sets, pliers, wrenches, drill kits & measuring tools",
                                "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=200&auto=format&fit=crop"));

                // --- TOOL STORE PRODUCTS SEEDING ---
                ToolStoreProduct p1 = toolStoreProductRepository.save(new ToolStoreProduct(
                                "Dual Run AC Capacitor 35+5 uF 450V",
                                "High performance heavy-duty dual run capacitor for outdoor split AC compressor and fan motor.",
                                480.0, 600.0, "SPARE_PART", "AC & Cooling", "CBB65", "AC-CAP-35", "SKU-AC-001",
                                "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop",
                                25, "AC Servicing / Repair", "Gree, General, Carrier 1.5 - 2.0 Ton"));
                p1.setSpecifications(
                                "{\"Voltage\":\"450V AC\",\"Capacity\":\"35+5 uF\",\"Frequency\":\"50/60Hz\",\"Tolerance\":\"+/-5%\",\"Warranty\":\"6 Months\"}");
                toolStoreProductRepository.save(p1);

                ToolStoreProduct p2 = toolStoreProductRepository.save(new ToolStoreProduct(
                                "High-Accuracy Digital Multimeter Tester",
                                "True RMS digital multimeter with auto-ranging, backlit display, voltage, current and continuity buzzer.",
                                1250.0, 1500.0, "TOOL", "Electrical", "Aneng", "AN-8002", "SKU-ELE-002",
                                "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=500&auto=format&fit=crop",
                                18, "Electrical Wiring / Circuit Repair, AC Servicing / Repair",
                                "Universal All Electrical Appliances"));
                p2.setSpecifications(
                                "{\"Display\":\"6000 Counts True RMS\",\"Voltage Range\":\"600mV - 1000V DC\",\"Safety Rank\":\"CAT III 600V\",\"Warranty\":\"1 Year\"}");
                toolStoreProductRepository.save(p2);

                ToolStoreProduct p3 = toolStoreProductRepository.save(new ToolStoreProduct(
                                "Refrigerator Defrost Thermostat Sensor",
                                "Universal bimetal defrost thermostat with fuse protector for no-frost refrigerators.",
                                350.0, 450.0, "SPARE_PART", "Refrigerator", "Walton", "REF-TH-01", "SKU-REF-003",
                                "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&auto=format&fit=crop",
                                40, "Refrigerator Repair", "Walton, Singer, Hitachi, LG No-Frost"));
                p3.setSpecifications(
                                "{\"Temp Cutout\":\"-7 deg C\",\"Current Rating\":\"10A\",\"Wire Length\":\"30cm\",\"Warranty\":\"3 Months\"}");
                toolStoreProductRepository.save(p3);

                ToolStoreProduct p4 = toolStoreProductRepository.save(new ToolStoreProduct(
                                "Insulated Copper Pipe Twin Roll 1/4\" & 1/2\" (5m)",
                                "Pre-insulated seamless copper tubing for R410A / R32 split air conditioner installation.",
                                2200.0, 2600.0, "ACCESSORY", "AC & Cooling", "Mueller", "COP-5M", "SKU-AC-004",
                                "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&auto=format&fit=crop",
                                12, "AC Servicing / Repair", "All 1.0 Ton & 1.5 Ton Split Inverter ACs"));
                p4.setSpecifications(
                                "{\"Length\":\"5 Meters\",\"Diameter\":\"1/4 inch & 1/2 inch\",\"Insulation\":\"UV Resistant Foam\",\"Warranty\":\"1 Year\"}");
                toolStoreProductRepository.save(p4);

                ToolStoreProduct p5 = toolStoreProductRepository.save(new ToolStoreProduct(
                                "Heavy-Duty Adjustable Pipe Wrench 14-Inch",
                                "Forged alloy steel drop-jaw pipe wrench designed for plumbing and water-line installations.",
                                850.0, 1050.0, "TOOL", "Plumbing", "Ingco", "HPW-14", "SKU-PLM-005",
                                "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500&auto=format&fit=crop",
                                15, "Plumbing & Water-Line Repair", "Universal Pipes up to 2 inches"));
                p5.setSpecifications(
                                "{\"Size\":\"14 Inches (350mm)\",\"Material\":\"Cr-Mo Steel\",\"Jaw Capacity\":\"50mm\",\"Warranty\":\"Lifetime Jaw Guarantee\"}");
                toolStoreProductRepository.save(p5);

                ToolStoreProduct p6 = toolStoreProductRepository.save(new ToolStoreProduct(
                                "Celling Fan Speed Regulator & Dimmer Switch",
                                "Stepless electronic fan speed controller switch compatible with standard gang switch boards.",
                                180.0, 220.0, "SPARE_PART", "Fan", "Click", "FAN-REG-01", "SKU-FAN-006",
                                "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop",
                                60, "Fan Servicing / Repair", "Ceiling Fans up to 100W"));
                p6.setSpecifications(
                                "{\"Max Power\":\"100W\",\"Voltage\":\"220-240V 50Hz\",\"Type\":\"Stepless Knob\",\"Warranty\":\"6 Months\"}");
                toolStoreProductRepository.save(p6);

                ToolStoreProduct p7 = toolStoreProductRepository.save(new ToolStoreProduct(
                                "Stainless Steel Heavy Duty Water Tap Valve",
                                "Rust-free SUS304 stainless steel angle valve tap for bathroom & kitchen water line connection.",
                                420.0, 520.0, "SPARE_PART", "Plumbing", "Sattar", "SS-TAP-02", "SKU-PLM-007",
                                "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=300&auto=format&fit=crop",
                                30, "Plumbing & Water-Line Repair", "Standard 1/2 inch thread fitting"));
                p7.setSpecifications(
                                "{\"Material\":\"SUS304 Stainless Steel\",\"Thread Size\":\"1/2 inch BSP\",\"Max Pressure\":\"1.6 MPa\",\"Warranty\":\"2 Years\"}");
                toolStoreProductRepository.save(p7);

                ToolStoreProduct p8 = toolStoreProductRepository.save(new ToolStoreProduct(
                                "Professional 38-in-1 Precision Screwdriver Set",
                                "Magnetic bit screwdriver kit including Torx, Phillips, Hex, and spudger tools for electronics & appliances.",
                                750.0, 950.0, "TOOL", "Tools", "Jakemy", "JM-8139", "SKU-TLS-008",
                                "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=300&auto=format&fit=crop",
                                20, "Electrical Wiring / Circuit Repair, General Home Maintenance",
                                "All Household Electronics & Appliances"));
                p8.setSpecifications(
                                "{\"Bit Count\":\"36 Bits\",\"Material\":\"S2 Alloy Steel\",\"Case\":\"Anti-static Hard Plastic Case\",\"Warranty\":\"1 Year\"}");
                toolStoreProductRepository.save(p8);

                // --- MOCK ORDERS SEEDING ---
                StoreOrder o1 = new StoreOrder();
                o1.setOrderNumber("#TS-10245");
                o1.setUser(customer);
                o1.setCustomerName(customer.getName());
                o1.setPhone(customer.getPhone());
                o1.setAddress("House 14, Road 4, Sector 12, Uttara, Dhaka");
                o1.setPaymentMethod("BKASH");
                o1.setPaymentStatus("SUCCESSFUL");
                o1.setOrderStatus("DELIVERED");
                o1.setTransactionId("BKASH-TXN-771239");
                o1.setSubtotal(1250.0);
                o1.setDeliveryFee(60.0);
                o1.setTotalAmount(1310.0);
                o1.addItem(new StoreOrderItem(p2, 1, 1250.0));
                storeOrderRepository.save(o1);

                // --- MOCK PRODUCT REVIEWS SEEDING ---
                productReviewRepository.save(new ProductReview(p2, customer, 5,
                                "Excellent multimeter! Precise readings for voltage & AC capacitance. Fast delivery in Dhaka.",
                                true));
                productReviewRepository.save(new ProductReview(p1, worker1, 5,
                                "Original CBB65 capacitor, replaced on client's Gree 1.5T AC and worked immediately.",
                                true));

                System.out.println(">>> SkillVerse Tool Store Module Database Pre-populated Successfully <<<");
        }
}
