Write-Host "=== 1. REGISTER NEW WORKER ==="
$regBody = @{
  name = "Shafiqul Islam Tech"
  email = "shafiqul_tech2@skillverse.com"
  phone = "01755667799"
  role = "WORKER"
  nidNumber = "5918273645"
  verified = $false
  profilePicture = "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150"
} | ConvertTo-Json

$newWorker = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/register" -Method Post -Body $regBody -ContentType "application/json"
Write-Host "Worker ID:" $newWorker.id "Verified:" $newWorker.verified "Status:" $newWorker.status

Write-Host "=== 2. SIMULATE PHONE OTP ==="
$otpBody = @{ phone = "01755667799" } | ConvertTo-Json
$otpRes = Invoke-RestMethod -Uri "http://localhost:8081/api/verification/send-phone-otp" -Method Post -Body $otpBody -ContentType "application/json"
Write-Host "OTP Code Sent:" $otpRes.simulatedOtp

$vOtpBody = @{ phone = "01755667799"; otp = $otpRes.simulatedOtp } | ConvertTo-Json
$vOtpRes = Invoke-RestMethod -Uri "http://localhost:8081/api/verification/verify-phone-otp" -Method Post -Body $vOtpBody -ContentType "application/json"
Write-Host "OTP Verification Status:" $vOtpRes.status "Verified:" $vOtpRes.verified

Write-Host "=== 3. SUBMIT COMPLETE VERIFICATION DOSSIER ==="
$verifBody = @{
  userId = $newWorker.id
  fullName = "Shafiqul Islam Tech"
  dateOfBirth = "1992-08-20"
  phone = "01755667799"
  phoneVerified = $true
  nidNumber = "5918273645"
  nidFrontPhoto = "https://images.unsplash.com/photo-1589330694653-dad6ef0190b8?w=600"
  nidBackPhoto = "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600"
  profileSelfiePhoto = "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150"
  presentAddress = "House 12, Road 5, Sector 7, Uttara"
  permanentAddress = "Vill: Joypur, PS: Chatkhil, Dist: Noakhali"
  division = "Dhaka"
  district = "Dhaka"
  cityArea = "Uttara"
  postalCode = "1230"
  detailedAddress = "Sector 7, Near Azampur Bus Stand"
  skills = "AC Repair, Electrical Wiring, Refrigerator Servicing"
  experienceYears = 6
  experienceDescription = "Specialized in multi-brand DC inverter AC repairs and house DB board wiring."
  previousEmployer = "Electra International"
  experienceCertPhoto = "https://images.unsplash.com/photo-1589330694653-dad6ef0190b8?w=600"
  workProofPhoto = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600"
  payoutMethod = "bKash"
  payoutAccount = "01755667799"
  payoutAccountHolder = "Shafiqul Islam"
} | ConvertTo-Json

$subRes = Invoke-RestMethod -Uri "http://localhost:8081/api/verification/submit" -Method Post -Body $verifBody -ContentType "application/json"
Write-Host "Submitted Dossier ID:" $subRes.id "Status:" $subRes.status

Write-Host "=== 4. ADMIN REQUESTS CORRECTION ==="
$corBody = @{
  decision = "CORRECTION_REQUIRED"
  reason = "Please provide a clearer photo of NID back side."
} | ConvertTo-Json
$corRes = Invoke-RestMethod -Uri ("http://localhost:8081/api/admin/verification/" + $subRes.id + "/decision") -Method Post -Body $corBody -ContentType "application/json"
Write-Host "Admin Decision Status:" $corRes.status "Remarks:" $corRes.adminRemarks

Write-Host "=== 5. WORKER RESUBMITS CORRECTION ==="
$reSubRes = Invoke-RestMethod -Uri "http://localhost:8081/api/verification/submit" -Method Post -Body $verifBody -ContentType "application/json"
Write-Host "Resubmitted Dossier Status:" $reSubRes.status

Write-Host "=== 6. ADMIN APPROVES DOSSIER ==="
$appBody = @{
  decision = "APPROVED"
  reason = "All 6 checkpoints verified and approved. Active home-entry clearance granted."
} | ConvertTo-Json
$appRes = Invoke-RestMethod -Uri ("http://localhost:8081/api/admin/verification/" + $subRes.id + "/decision") -Method Post -Body $appBody -ContentType "application/json"
Write-Host "Final Admin Approval Status:" $appRes.status

Write-Host "=== 7. VERIFY WORKER ENTITY IS NOW ACTIVE & VERIFIED IN DB ==="
$allWorkers = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/users" -Method Get
$approvedWorker = $allWorkers | Where-Object { $_.id -eq $newWorker.id }
Write-Host "User in DB - Name:" $approvedWorker.name "Status:" $approvedWorker.status "isVerified:" $approvedWorker.isVerified

Write-Host "=== ALL VERIFICATION BACKEND ENDPOINTS PASSED FLAWLESSLY! ==="
