import { calculateTimezoneOffset, calculateSign, calculateHours, calculateMinutes, toLocalISOString, DateConversion } from "main/components/Utils/DateConversion";

describe('Arithmetic Operator Functions', () => {

    const localTimezoneOffsetInMinutes = new Date().getTimezoneOffset();
    const localTimezoneOffsetInHours = -localTimezoneOffsetInMinutes / 60;

    it('correctly calculates the timezone offset', () => {
      const date = new Date('2024-05-18T10:00:00.000+08:00');
      const offset = calculateTimezoneOffset(date);
      expect(offset).toBe(60 * localTimezoneOffsetInHours);
    });
  
    it('correctly calculates the sign for positive offset', () => {
      const offset = 300;
      const sign = calculateSign(offset);
      expect(sign).toBe('+');
    });
  
    it('correctly calculates the sign for negative offset', () => {
      const offset = -480;
      const sign = calculateSign(offset);
      expect(sign).toBe('-');
    });
  
    it('correctly calculates the sign for zero offset', () => {
      const offset = 0;
      const sign = calculateSign(offset);
      expect(sign).toBe('+');
    });
  
    it('correctly calculates hours for positive offset', () => {
      const offset = 300;
      const hours = calculateHours(offset);
      expect(hours).toBe('05');
    });
  
    it('correctly calculates hours for negative offset', () => {
      const offset = -480;
      const hours = calculateHours(offset);
      expect(hours).toBe('08');
    });
  
    it('correctly calculates hours for zero offset', () => {
      const offset = 0;
      const hours = calculateHours(offset);
      expect(hours).toBe('00');
    });

    it('correctly calculates the sign for -0 offset', () => {
        const offset = -0;
        const sign = calculateSign(offset);
        expect(sign).toBe('+');
    });

    it('correctly calculates the sign for +0 offset', () => {
        const offset = +0;
        const sign = calculateSign(offset);
        expect(sign).toBe('+');
    });

    it('correctly calculates minutes for positive offset', () => {
        const offset = 300;
        const minutes = calculateMinutes(offset);
        expect(minutes).toBe('00');
    });
  
    it('correctly calculates minutes for negative offset', () => {
      const offset = -480;
      const minutes = calculateMinutes(offset);
      expect(minutes).toBe('00');
    });
  
    it('correctly calculates minutes for non-zero offset', () => {
      const offset = -345;
      const minutes = calculateMinutes(offset);
      expect(minutes).toBe('45');
    });
  });

  describe('toLocalISOString', () => {
    const localTimezoneOffsetInMinutes = new Date().getTimezoneOffset();
    const localTimezoneOffsetInHours = -localTimezoneOffsetInMinutes / 60;
    const expectedSign = localTimezoneOffsetInMinutes <= 0 ? '+' : '-';
    const formattedOffsetHours = String(Math.abs(Math.floor(localTimezoneOffsetInMinutes / 60))).padStart(2, '0');
    const formattedOffsetMinutes = String(Math.abs(localTimezoneOffsetInMinutes % 60)).padStart(2, '0');

    const formatExpectedISO = (date) => {
        const pad = (num, size = 2) => String(num).padStart(size, '0');
        const expectedDate = new Date(date);
        expectedDate.setMinutes(expectedDate.getMinutes() - localTimezoneOffsetInMinutes);
        const datePart = `${expectedDate.getFullYear()}-${pad(expectedDate.getMonth() + 1, 2)}-${pad(expectedDate.getDate(), 2)}`;
        const timePart = `${pad(expectedDate.getHours(), 2)}:${pad(expectedDate.getMinutes(), 2)}:${pad(expectedDate.getSeconds(), 2)}.${pad(expectedDate.getMilliseconds(), 2)}`;
        return `${datePart}T${timePart}${expectedSign}${formattedOffsetHours}:${formattedOffsetMinutes}`;
    };

    it('correctly formats a date to local ISO string', () => {
        const date = new Date('2024-05-18T03:00:00.000Z');
        const localISO = toLocalISOString(date);
        const expectedISO = formatExpectedISO(date);
        expect(localISO).toBe(expectedISO);
    });

    it('handles dates at the start of the year correctly', () => {
        const date = new Date('2023-12-31T17:00:00.000Z');
        const localISO = toLocalISOString(date);
        const expectedISO = formatExpectedISO(date);
        expect(localISO).toBe(expectedISO);
    });

    it('handles dates at the end of the year correctly', () => {
        const date = new Date('2024-12-31T16:59:59.999Z');
        const localISO = toLocalISOString(date);
        const expectedISO = formatExpectedISO(date);
        expect(localISO).toBe(expectedISO);
    });

    it('handles dates with daylight saving time changes correctly', () => {
        const date = new Date('2024-03-09T19:30:00.000Z');
        const localISO = toLocalISOString(date);
        const expectedISO = formatExpectedISO(date);
        expect(localISO).toBe(expectedISO);
    });
});


describe('DateConversion', () => {
  const localTimezoneOffsetInMinutes = new Date().getTimezoneOffset();

    it('should return the correct today date', () => {
        const date = new Date('2024-05-21T17:00:00.000Z');
        const [today, nextMonth] = DateConversion(date);

        const expectedToday = new Date(date);
        expectedToday.setMinutes(expectedToday.getMinutes() - localTimezoneOffsetInMinutes);

        const expectedNextMonth = new Date(expectedToday);
        expectedNextMonth.setMonth(expectedNextMonth.getMonth() + 1);

        const formatDate = (d) => d.toISOString().split('T')[0];

        expect(today).toBe(formatDate(expectedToday));
        expect(nextMonth).toBe(formatDate(expectedNextMonth));
    });

});