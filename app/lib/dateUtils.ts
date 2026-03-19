
export const formatDisplayDate = (dateValue: any): string => {
  if (!dateValue) return 'Recent';

  try {
    let dateObj: Date;


    if (typeof dateValue === 'string') {
      dateObj = new Date(dateValue);
    }
   
    else if (typeof dateValue === 'number') {
      dateObj = new Date(dateValue);
    }
    
    else if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
      dateObj = new Date(dateValue.seconds * 1000);
    }
    else {
      return 'N/A';
    }

  
    if (isNaN(dateObj.getTime())) return 'N/A';

    
    return dateObj.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};


export const dateToMillis = (dateValue: any): number | null => {
  if (!dateValue) return null;

  try {
    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      const time = new Date(dateValue).getTime();
      return isNaN(time) ? null : time;
    }
 
    if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
      return dateValue.seconds * 1000;
    }
    return null;
  } catch (error) {
    console.error('Error converting date to millis:', error);
    return null;
  }
};

export const formatFirebaseDate = formatDisplayDate;
export const firebaseTimestampToMillis = dateToMillis;