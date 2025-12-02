export function normalizedEmploymentType(type: string) {
  switch (type) {
    case "FULL_TIME":
      return "Full Time";
    case "PART_TIME":
      return "Part Time";
    case "CONTRACT":
      return "Contract";
    case "INTERNSHIP":
      return "Internship";
    case "FREELANCE":
      return "Freelance";
    default:
      return type;
  }
}

export function normalizedWorkType(type: string) {
  switch (type) {
    case "ONSITE":
      return "Onsite";
    case "REMOTE":
      return "Remote";
    case "HYBRID":
      return "Hybrid";
    default:
      return type;
  }
}

export function normalizedRole(role: string) {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "SUPER_ADMIN":
      return "Super Admin";
    case "CANDIDATE":
      return "Candidate";
    default:
      return role;
  }
}
