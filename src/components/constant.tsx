export const specialties = [" Bridal ","Makeup Artist", "Hair Stylist"];


export const capitalizeFirstLetter = (str: string) => {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };