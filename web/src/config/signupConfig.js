
export const signupConfig = {
  student: {
    title: "Student Sign up",
    subtitle: "Create your account and start your skills with showmyskills",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", placeholder: "e.g. Tara Joshi" },
      { name: "email", label: "Email Address", type: "email", placeholder: "you@university.edu" },
      { name: "phone", label: "Phone Number", type: "tel", placeholder: "+91 98765 43210" },
      { name: "college", label: "College / University Name", type: "text", placeholder: "e.g. National Institute of Technology" },
      { name: "graduationYear", label: "Graduation Year", type: "number", placeholder: "e.g. 2026" },
      { name: "collegeId", label: "College ID / Roll Number", type: "text", placeholder: "e.g. UNI-2022-CS-042" },
      { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
      { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "••••••••" },
    ],
  },
  company: {
    title: "Company Sign up",
    subtitle: "Select the candidates as per your requirements with showmyskills",
    fields: [
      { name: "companyName", label: "Company Name", type: "text", placeholder: "e.g. XYZ Company" },
      { name: "email", label: "Office Email Address", type: "email", placeholder: "hello@xyzcompany.com" },
      { name: "phone", label: "Phone Number", type: "tel", placeholder: "+91 98765 43210" },
      { name: "website", label: "Website Link", type: "url", placeholder: "e.g. https://xyzcompany.com" },
      { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
      { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "••••••••" },
    ],
  },
  college: {
    title: "College Sign up",
    subtitle: "Improve placement outcomes with showmyskills",
    fields: [
      { name: "collegeName", label: "College Name", type: "text", placeholder: "e.g. National Institute of Technology" },
      { name: "email", label: "College Email Address", type: "email", placeholder: "you@college.edu" },
      { name: "phone", label: "Phone Number", type: "tel", placeholder: "+91 98765 43210" },
      { name: "website", label: "Website Link", type: "url", placeholder: "e.g. https://university.edu" },
      { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
      { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "••••••••" },
    ],
  },
  admin: {
    title: "Admin Access Application",
    subtitle: "Apply for administrator privileges with showmyskills",
    fields: [
      { name: "fullName", label: "Applicant Full Name", type: "text", placeholder: "e.g. Jordan Hayes" },
      { name: "email", label: "Applicant Email Address", type: "email", placeholder: "admin.applicant@domain.com" },
      { name: "phone", label: "Phone Number", type: "tel", placeholder: "+91 98765 43210" },
      { name: "dob", label: "Date of Birth", type: "text", placeholder: "YYYY-MM-DD" },
    ],
  },
};