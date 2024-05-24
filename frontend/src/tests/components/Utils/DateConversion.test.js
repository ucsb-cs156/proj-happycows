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

const correctHourOffset = 0;
const correctOffset = () => {
  const date = new Date('2024-05-18T10:00:00.000+08:00');
  const localISO = toLocalISOString(date);
  //calculate hourly difference
  correctHourOffset = date.slice(11,13).toString()-localISO.slice(11,13).toString()
  return correctHourOffset;
};
const formatExpectedISO = (date) => {
  correctOffset;
  const pad = (num, size = 2) => String(num).padStart(size, '0');
  const expectedDate = new Date(date.getTime());
  expectedDate.setHours(expectedDate.getUTCHours() - correctHourOffset);
  const datePart = `${expectedDate.getUTCFullYear()}-${pad(expectedDate.getUTCMonth() + 1, 2)}-${pad(expectedDate.getUTCDate(), 2)}`;
  const timePart = `${pad(expectedDate.getUTCHours(), 2)}:${pad(expectedDate.getUTCMinutes(), 2)}:${pad(expectedDate.getUTCSeconds(), 2)}.${pad(expectedDate.getUTCMilliseconds(), 2)}`;
  return `${datePart}T${timePart}+00:00`;
};

describe('toLocalISOString', () => {
  it('correctly formats a date to local ISO string', () => {
    const date = new Date('2024-05-18T10:00:00.000Z');
    const localISO = toLocalISOString(date);
    const expectedISO = formatExpectedISO(new Date('2024-05-18T03:00:00.00-07:00'));
    expect(localISO).toBe(expectedISO);
  });

  it('handles dates at the start of the year correctly', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    const localISO = toLocalISOString(date);

    const expectedISO = formatExpectedISO(new Date('2023-12-31T16:00:00.00-08:00'));

    expect(localISO).toBe(expectedISO);
  });

  it('handles dates at the end of the year correctly', () => {
    const date = new Date('2024-12-31T23:59:59.999Z');
    const localISO = toLocalISOString(date);

    const expectedISO = formatExpectedISO(new Date('2024-12-31T15:59:59.999-08:00'));

    expect(localISO).toBe(expectedISO);
  });

  it('handles dates with daylight saving time changes correctly', () => {
    const date = new Date('2024-03-10T02:30:00.000Z');
    const localISO = toLocalISOString(date);

    const expectedISO = formatExpectedISO(new Date('2024-03-09T18:30:00.00-08:00'));

    expect(localISO).toBe(expectedISO);
  });
});

describe('DateConversion', () => {
  it('should return the correct today date', () => {
    const date = new Date('2024-05-22T00:00:00.000Z');
    const expectedISODate = formatExpectedISO(new Date('2024-05-22T00:00:00.000Z'));
    const [today, nextMonth] = DateConversion(date);
    const expectedISONextMonth = formatExpectedISO(new Date('2024-06-22T00:00:00.000Z'));
    expect(today).toBe(expectedISODate.slice(0,10));
    expect(nextMonth).toBe(expectedISONextMonth.slice(0,10));
  });

});