import { 
  formatCurrency, 
  formatNumber, 
  getInitials, 
  getDateColor,
  getStatusColor 
} from '../helpers';

describe('Helper Functions', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(1234567)).toBe('$1,234,567');
      expect(formatCurrency(0)).toBe('$0');
      expect(formatCurrency(100.99)).toBe('$101');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with commas', () => {
      expect(formatNumber(1234)).toBe('1,234');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('getInitials', () => {
    it('gets initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Jane Mary Smith')).toBe('JM');
      expect(getInitials('Madonna')).toBe('M');
      expect(getInitials('')).toBe('');
    });
  });

  describe('getDateColor', () => {
    it('returns red for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(getDateColor(pastDate.toISOString())).toBe('red');
    });

    it('returns gray for undefined dates', () => {
      expect(getDateColor()).toBe('gray');
    });
  });

  describe('getStatusColor', () => {
    it('returns correct colors for different statuses', () => {
      expect(getStatusColor('NEW')).toBe('blue');
      expect(getStatusColor('QUALIFIED')).toBe('green');
      expect(getStatusColor('WON')).toBe('emerald');
      expect(getStatusColor('LOST')).toBe('gray');
      expect(getStatusColor('UNKNOWN')).toBe('gray');
    });
  });
});