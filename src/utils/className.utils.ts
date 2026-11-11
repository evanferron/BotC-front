type ClassValue = string | number | bigint | boolean | null | undefined;

// Assemble des classes CSS en ignorant les valeurs vides
export const cx = (...classes: ClassValue[]): string => classes.filter(Boolean).join(' ');
