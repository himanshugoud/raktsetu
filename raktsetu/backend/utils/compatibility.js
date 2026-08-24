// Standard ABO/Rh whole-blood donor -> recipient compatibility rules.
// O- is the universal donor, AB+ is the universal recipient.
export const BLOOD_TYPES = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

// Map of bloodType -> list of blood types that CAN DONATE TO it (recipient view)
const CAN_RECEIVE_FROM = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": BLOOD_TYPES, // universal recipient
};

// Inverted map: bloodType -> list of blood types it CAN DONATE TO (donor view)
const CAN_DONATE_TO = BLOOD_TYPES.reduce((acc, type) => {
  acc[type] = BLOOD_TYPES.filter((recipient) =>
    CAN_RECEIVE_FROM[recipient].includes(type)
  );
  return acc;
}, {});

export function isCompatible(donorType, recipientType) {
  if (!BLOOD_TYPES.includes(donorType) || !BLOOD_TYPES.includes(recipientType)) {
    return false;
  }
  return CAN_RECEIVE_FROM[recipientType].includes(donorType);
}

// Given the blood type needed by a patient, return every donor blood type
// that is safe to use.
export function compatibleDonorTypes(recipientType) {
  return CAN_RECEIVE_FROM[recipientType] || [];
}

export function compatibleRecipientTypes(donorType) {
  return CAN_DONATE_TO[donorType] || [];
}

export default {
  BLOOD_TYPES,
  isCompatible,
  compatibleDonorTypes,
  compatibleRecipientTypes,
};
