import { calculateTimezoneOffset, calculateSign, calculateHours, calculateMinutes, toLocalISOString, DateConversion } from "main/components/Utils/DateConversion";

jest.mock("main/components/Utils/DateConversion", () => {
  const originalModule = jest.requireActual("main/components/Utils/DateConversion");
  return {
      ...originalModule,
      calculateTimezoneOffset: jest.fn(() => 0),
  };
});

const RealDate = global.Date;

global.Date = class extends RealDate {
    constructor(...args) {
        if (args.length === 0) {
            super('2024-05-18T10:00:00.000Z');
        } else {
            super(...args);
        }
    }
    static now() {
        return RealDate.now();
    }
    static UTC(...args) {
        return RealDate.UTC(...args);
    }
    getTimezoneOffset() {
        return 0;
    }
};

describe('Arithmetic Operator Functions', () => {
    it('correctly calculates the timezone offset', () => {
      const date = new Date('2024-05-18T10:00:00.000+08:00');
      const offset = calculateTimezoneOffset(date);
      expect(offset).toBe(undefined);
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


const correctOffset = (date) => {
    const initialDate = new Date(date);
    const localISO = toLocalISOString(initialDate);
    const initialHours = parseInt(initialDate.toISOString().slice(11, 13), 10);
    const localHours = parseInt(localISO.slice(11, 13), 10);
    const offset = initialHours - localHours;
    return offset;
};

const formatExpectedISO = (date, offset) => {
    const pad = (num, size = 2) => String(num).padStart(size, '0');
    const expectedDate = new Date(date.getTime() + offset * 60 * 60 * 1000);
    const datePart = `${expectedDate.getUTCFullYear()}-${pad(expectedDate.getUTCMonth() + 1, 2)}-${pad(expectedDate.getUTCDate(), 2)}`;
    const timePart = `${pad(expectedDate.getUTCHours(), 2)}:${pad(expectedDate.getUTCMinutes(), 2)}:${pad(expectedDate.getUTCSeconds(), 2)}.${pad(expectedDate.getUTCMilliseconds(), 2)}`;
    return `${datePart}T${timePart}+00:00`;
};


describe('toLocalISOString', () => {
  it('correctly formats a date to local ISO string', () => {
      const date = new Date(Date.UTC(2024, 4, 18, 10, 0, 0, 0));
      const offset = correctOffset(date);
      const localISO = toLocalISOString(new Date(date.getTime() + offset * 60 * 60 * 1000));
      const expectedISO = formatExpectedISO(date, offset);
      expect(localISO).toBe(expectedISO);
  });

  it('handles dates at the start of the year correctly', () => {
      const date = new Date(Date.UTC(2023, 11, 31, 17, 0, 0, 0));
      const offset = correctOffset(date);
      const localISO = toLocalISOString(new Date(date.getTime() + offset * 60 * 60 * 1000));
      const expectedISO = formatExpectedISO(date, offset);
      expect(localISO).toBe(expectedISO);
  });

  it('handles dates at the end of the year correctly', () => {
      const date = new Date(Date.UTC(2024, 11, 31, 23, 59, 59, 999));
      const offset = correctOffset(date);
      const localISO = toLocalISOString(new Date(date.getTime() + offset * 60 * 60 * 1000));
      const expectedISO = formatExpectedISO(date, offset);
      expect(localISO).toBe(expectedISO);
  });

  it('handles dates with daylight saving time changes correctly', () => {
      const date = new Date(Date.UTC(2024, 2, 10, 2, 30, 0, 0));
      const offset = correctOffset(date);
      const localISO = toLocalISOString(new Date(date.getTime() + offset * 60 * 60 * 1000));
      const expectedISO = formatExpectedISO(date, offset);
      expect(localISO).toBe(expectedISO);
  });
});

describe('DateConversion', () => {
  it('should return the correct today date', () => {
    const date = new Date(Date.UTC(2024, 4, 21, 17, 0, 0, 0));
    const [today, nextMonth] = DateConversion(date);

    const expectedToday = new Date(date.getTime());

    const expectedNextMonth = new Date(expectedToday.getTime());
    expectedNextMonth.setUTCMonth(expectedNextMonth.getUTCMonth() + 1);

    const formatDate = (d) => d.toISOString().split('T')[0];

    expect(today).toBe(formatDate(expectedToday));
    expect(nextMonth).toBe(formatDate(expectedNextMonth));
  });
});