// College domain mapping - extend as needed
export const COLLEGE_DOMAINS: Record<string, { name: string; code: string } | null> = {
  // IITs
  "iitb.ac.in": { name: "IIT Bombay", code: "IITB" },
  "iitd.ac.in": { name: "IIT Delhi", code: "IITD" },
  "iitm.ac.in": { name: "IIT Madras", code: "IITM" },
  "iitk.ac.in": { name: "IIT Kanpur", code: "IITK" },
  "iitkgp.ac.in": { name: "IIT Kharagpur", code: "IITKGP" },
  "iitr.ac.in": { name: "IIT Roorkee", code: "IITR" },
  "iitg.ac.in": { name: "IIT Guwahati", code: "IITG" },
  "iith.ac.in": { name: "IIT Hyderabad", code: "IITH" },
  "iitbhu.ac.in": { name: "IIT BHU", code: "IITBHU" },
  "iitism.ac.in": { name: "IIT ISM Dhanbad", code: "IITISM" },
  "iitj.ac.in": { name: "IIT Jodhpur", code: "IITJ" },
  "iitp.ac.in": { name: "IIT Patna", code: "IITP" },
  "iitrpr.ac.in": { name: "IIT Ropar", code: "IITRPR" },
  "iitmandi.ac.in": { name: "IIT Mandi", code: "IITMANDI" },
  "iitgn.ac.in": { name: "IIT Gandhinagar", code: "IITGN" },
  "iitbbs.ac.in": { name: "IIT Bhubaneswar", code: "IITBBS" },
  "iitbhilai.ac.in": { name: "IIT Bhilai", code: "IITBHILAI" },
  "iitgoa.ac.in": { name: "IIT Goa", code: "IITGOA" },
  "iitjammu.ac.in": { name: "IIT Jammu", code: "IITJAMMU" },
  "iitdh.ac.in": { name: "IIT Dharwad", code: "IITDH" },
  "iittp.ac.in": { name: "IIT Tirupati", code: "IITTP" },
  "iitpalakkad.ac.in": { name: "IIT Palakkad", code: "IITPKD" },
  
  // NITs
  "nitc.ac.in": { name: "NIT Calicut", code: "NITC" },
  "nits.ac.in": { name: "NIT Surathkal", code: "NITS" },
  "nitw.ac.in": { name: "NIT Warangal", code: "NITW" },
  "nittrichy.ac.in": { name: "NIT Trichy", code: "NITT" },
  "nitkkr.ac.in": { name: "NIT Kurukshetra", code: "NITKKR" },
  "nitrkl.ac.in": { name: "NIT Rourkela", code: "NITRKL" },
  "nitdgp.ac.in": { name: "NIT Durgapur", code: "NITDGP" },
  "nitsri.ac.in": { name: "NIT Srinagar", code: "NITSRI" },
  "nitj.ac.in": { name: "NIT Jamshedpur", code: "NITJ" },
  "nitp.ac.in": { name: "NIT Patna", code: "NITP" },
  "nitrr.ac.in": { name: "NIT Raipur", code: "NITRR" },
  "nith.ac.in": { name: "NIT Hamirpur", code: "NITH" },
  "nitsikkim.ac.in": { name: "NIT Sikkim", code: "NITSKM" },
  "nitm.ac.in": { name: "NIT Meghalaya", code: "NITM" },
  "nita.ac.in": { name: "NIT Arunachal Pradesh", code: "NITA" },
  "nitnagaland.ac.in": { name: "NIT Nagaland", code: "NITN" },
  "nitmanipur.ac.in": { name: "NIT Manipur", code: "NITMNP" },
  "nitmizoram.ac.in": { name: "NIT Mizoram", code: "NITMZ" },
  "nituk.ac.in": { name: "NIT Uttarakhand", code: "NITUK" },
  "nitdelhi.ac.in": { name: "NIT Delhi", code: "NITD" },
  "nitgoa.ac.in": { name: "NIT Goa", code: "NITGOA" },
  "nitpuducherry.ac.in": { name: "NIT Puducherry", code: "NITPY" },
  "nitandhra.ac.in": { name: "NIT Andhra Pradesh", code: "NITANP" },
  
  // IIITs
  "iiit.ac.in": { name: "IIIT Hyderabad", code: "IIITH" },
  "iiitb.ac.in": { name: "IIIT Bangalore", code: "IIITB" },
  "iiitd.ac.in": { name: "IIIT Delhi", code: "IIITD" },
  "iiita.ac.in": { name: "IIIT Allahabad", code: "IIITA" },
  "iiitg.ac.in": { name: "IIIT Gwalior", code: "IIITG" },
  "iiitdm.ac.in": { name: "IIITDM Kancheepuram", code: "IIITDM" },
  "iiitdmj.ac.in": { name: "IIITDM Jabalpur", code: "IIITDMJ" },
  "iiits.ac.in": { name: "IIIT Srirangam", code: "IIITS" },
  "iiitk.ac.in": { name: "IIIT Kottayam", code: "IIITK" },
  "iiitl.ac.in": { name: "IIIT Lucknow", code: "IIITL" },
  "iiitk2.ac.in": { name: "IIIT Kalyani", code: "IIITK2" },
  "iiitu.ac.in": { name: "IIIT Una", code: "IIITU" },
  "iiitsurat.ac.in": { name: "IIIT Surat", code: "IIITSR" },
  "iiitv.ac.in": { name: "IIIT Vadodara", code: "IIITV" },
  "iiitkottayam.ac.in": { name: "IIIT Kottayam", code: "IIITKTY" },
  
  // Central Universities
  "du.ac.in": { name: "University of Delhi", code: "DU" },
  "jnu.ac.in": { name: "Jawaharlal Nehru University", code: "JNU" },
  "bhu.ac.in": { name: "Banaras Hindu University", code: "BHU" },
  "amu.ac.in": { name: "Aligarh Muslim University", code: "AMU" },
  "jamia.ac.in": { name: "Jamia Millia Islamia", code: "JMI" },
  "hyderabad.ac.in": { name: "University of Hyderabad", code: "UOH" },
  "pondiuni.ac.in": { name: "Pondicherry University", code: "PU" },
  "tezu.ac.in": { name: "Tezpur University", code: "TU" },
  "cus.ac.in": { name: "Cochin University", code: "CUSAT" },
  "mgmu.ac.in": { name: "Mahatma Gandhi University", code: "MGU" },
  "klyuniv.ac.in": { name: "Kalyani University", code: "KU" },
  "bbauniversity.ac.in": { name: "Babasaheb Bhimrao Ambedkar University", code: "BBAU" },
  "centraluniversity.ac.in": { name: "Central University", code: "CU" },
  
  // State Universities - Maharashtra
  "mu.ac.in": { name: "Mumbai University", code: "MU" },
  "unipune.ac.in": { name: "Savitribai Phule Pune University", code: "SPPU" },
  "shivaji.ac.in": { name: "Shivaji University", code: "SU" },
  "solapuruniversity.ac.in": { name: "Solapur University", code: "SUN" },
  "sgbau.ac.in": { name: "Sant Gadge Baba Amravati University", code: "SGBAU" },
  "nmu.ac.in": { name: "North Maharashtra University", code: "NMU" },
  "dbatu.ac.in": { name: "Dr. Babasaheb Ambedkar Technological University", code: "DBATU" },
  "rtmnu.ac.in": { name: "Rashtrasant Tukadoji Maharaj Nagpur University", code: "RTMNU" },
  "gondwana.ac.in": { name: "Gondwana University", code: "GU" },
  "ycmou.ac.in": { name: "Yashwantrao Chavan Maharashtra Open University", code: "YCMOU" },
  
  // State Universities - Karnataka
  "bangaloreuniversity.ac.in": { name: "Bangalore University", code: "BU" },
  "vtubelgaum.ac.in": { name: "Visvesvaraya Technological University", code: "VTU" },
  "mysoreuniversity.ac.in": { name: "University of Mysore", code: "UOM" },
  "kud.ac.in": { name: "Karnatak University", code: "KUD" },
  "gulbargauniversity.ac.in": { name: "Gulbarga University", code: "GUG" },
  "kswu.ac.in": { name: "Karnataka State Women's University", code: "KSWU" },
  "davangereuniversity.ac.in": { name: "Davangere University", code: "DVU" },
  "tumkuruniversity.ac.in": { name: "Tumkur University", code: "TU" },
  "rcub.ac.in": { name: "Rani Channamma University", code: "RCU" },
  "vskub.ac.in": { name: "Vijayanagara Sri Krishnadevaraya University", code: "VSKUB" },
  "ksnu.ac.in": { name: "Karnataka Sanskrit University", code: "KSU" },
  "kuvempu.ac.in": { name: "Kuvempu University", code: "KU" },
  
  // State Universities - Tamil Nadu
  "annauniv.edu": { name: "Anna University", code: "AU" },
  "unom.ac.in": { name: "University of Madras", code: "UNOM" },
  "bdu.ac.in": { name: "Bharathidasan University", code: "BDU" },
  "mkuniversity.ac.in": { name: "Madurai Kamaraj University", code: "MKU" },
  "periyaruniversity.ac.in": { name: "Periyar University", code: "PU" },
  "tnau.ac.in": { name: "Tamil Nadu Agricultural University", code: "TNAU" },
  "tuv.ac.in": { name: "Thiruvalluvar University", code: "TVU" },
  "alagappauniversity.ac.in": { name: "Alagappa University", code: "ALU" },
  "manonmaniam.ac.in": { name: "Manonmaniam Sundaranar University", code: "MSU" },
  "tnoou.ac.in": { name: "Tamil Nadu Open University", code: "TNOU" },
  
  // State Universities - Other
  "osmania.ac.in": { name: "Osmania University", code: "OU" },
  "jntuh.ac.in": { name: "JNTU Hyderabad", code: "JNTUH" },
  "jntuk.edu.in": { name: "JNTU Kakinada", code: "JNTUK" },
  "jntua.ac.in": { name: "JNTU Anantapur", code: "JNTUA" },
  "au.ac.in": { name: "Andhra University", code: "AU" },
  "svu.ac.in": { name: "Sri Venkateswara University", code: "SVU" },
  "ku.ac.in": { name: "Kakatiya University", code: "KU" },
  "mguniversity.ac.in": { name: "Mahatma Gandhi University", code: "MGU" },
  "cusat.ac.in": { name: "Cochin University of Science and Technology", code: "CUSAT" },
  "keralauniversity.ac.in": { name: "University of Kerala", code: "UOK" },
  "calicutuniversity.ac.in": { name: "University of Calicut", code: "UOC" },
  "kannuruniversity.ac.in": { name: "Kannur University", code: "KU" },
  "mguni.ac.in": { name: "Mahatma Gandhi University Kottayam", code: "MGU" },
  "srtmun.ac.in": { name: "Swami Ramanand Teerth Marathwada University", code: "SRTMU" },
  "prsu.ac.in": { name: "Pt. Ravishankar Shukla University", code: "PRSU" },
  "ggu.ac.in": { name: "Guru Ghasidas University", code: "GGU" },
  "bup.edu.in": { name: "Bundelkhand University", code: "BU" },
  "drbragu.ac.in": { name: "Dr. B.R. Ambedkar University", code: "BRAU" },
  "lucknowuniversity.ac.in": { name: "University of Lucknow", code: "LU" },
  "ccsuniversity.ac.in": { name: "Chaudhary Charan Singh University", code: "CCSU" },
  "mjpru.ac.in": { name: "M.J.P. Rohilkhand University", code: "MJPRU" },
  "csjmu.ac.in": { name: "Chhatrapati Shahu Ji Maharaj University", code: "CSJMU" },
  "ju.ac.in": { name: "Jadavpur University", code: "JU" },
  "cu.ac.in": { name: "Calcutta University", code: "CU" },
  "kgpian.iitkgp.ac.in": { name: "IIT Kharagpur", code: "IITKGP" },
  
  // Private Universities
  "bits-pilani.ac.in": { name: "BITS Pilani", code: "BITS" },
  "manipal.edu": { name: "Manipal Academy of Higher Education", code: "MAHE" },
  "vit.ac.in": { name: "VIT Vellore", code: "VIT" },
  "vitbhopal.ac.in": { name: "VIT Bhopal", code: "VITB" },
  "vitap.ac.in": { name: "VIT-AP", code: "VITAP" },
  "vitchennai.ac.in": { name: "VIT Chennai", code: "VITC" },
  "srmist.edu.in": { name: "SRM Institute of Science and Technology", code: "SRM" },
  "srmap.edu.in": { name: "SRM-AP", code: "SRMAP" },
  "srmuniv.ac.in": { name: "SRM University", code: "SRMU" },
  "amrita.edu": { name: "Amrita Vishwa Vidyapeetham", code: "AVV" },
  "lpude.in": { name: "Lovely Professional University", code: "LPU" },
  "chitkara.edu.in": { name: "Chitkara University", code: "CU" },
  "thapar.edu": { name: "Thapar Institute", code: "TIET" },
  "niituniversity.in": { name: "NIIT University", code: "NIU" },
  "ashoka.edu.in": { name: "Ashoka University", code: "AU" },
  "flame.edu.in": { name: "FLAME University", code: "FLAME" },
  "azimpremjiuniversity.edu.in": { name: "Azim Premji University", code: "APU" },
  "krea.edu.in": { name: "Krea University", code: "KREA" },
  "plaksha.edu.in": { name: "Plaksha University", code: "PLK" },
  
  // Generic fallbacks (not colleges)
  "gmail.com": null,
  "yahoo.com": null,
  "outlook.com": null,
  "hotmail.com": null,
};

export function detectCollegeFromEmail(email: string): { name: string; code: string } | null {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;
  
  // Direct match
  const directMatch = COLLEGE_DOMAINS[domain];
  if (directMatch) {
    return directMatch;
  }
  
  // Try subdomain matching (e.g., student.iitb.ac.in -> iitb.ac.in)
  const parts = domain.split(".");
  for (let i = 1; i < parts.length; i++) {
    const parentDomain = parts.slice(i).join(".");
    const parentMatch = COLLEGE_DOMAINS[parentDomain];
    if (parentMatch) {
      return parentMatch;
    }
  }
  
  return null;
}

export function validatePasswordStrength(password: string): { 
  valid: boolean; 
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("At least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("One uppercase letter (A-Z)");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("One lowercase letter (a-z)");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("One number (0-9)");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("One special character (!@#$%^&*)");
  }
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (password.length >= 12 && errors.length <= 1) strength = 'strong';
  else if (password.length >= 8 && errors.length <= 2) strength = 'medium';
  
  return {
    valid: errors.length === 0,
    errors,
    strength
  };
}

export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'strong': return 'bg-green-500';
  }
}