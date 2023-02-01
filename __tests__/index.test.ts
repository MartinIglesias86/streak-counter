import { JSDOM } from 'jsdom'
import { streakCounter } from "../src/index"
import { formattedDate } from '../src/utils'

describe('streakCounter', () => {
  let mockLocalStorage: Storage

  beforeEach(() => { 
    const mockJSDom = new JSDOM('', { url: 'http://localhost' })
    mockLocalStorage = mockJSDom.window.localStorage
  })
  afterEach(() => {
    mockLocalStorage.clear()
  })

  it('should return a streak object with currentCount, startDate and lastLoginDate', () => {
    const date = new Date()
    const streak = streakCounter(mockLocalStorage, date)

    expect(streak.hasOwnProperty('currentCount')).toBe(true)
    expect(streak.hasOwnProperty('startDate')).toBe(true)
    expect(streak.hasOwnProperty('lastLoginDate')).toBe(true)
  })

  it('should return a streak starting at 1 and keep track of lastLoginDate', () => {
    const date = new Date()
    const streak = streakCounter(mockLocalStorage, date)

    const dateFormatted = formattedDate(date)

    expect(streak.currentCount).toBe(1)
    expect(streak.startDate).toBe(dateFormatted)
  })

  it('should store the streak in localStorage', () => {
    const date = new Date()
    const key = 'streak'
    streakCounter(mockLocalStorage, date)

    const streakAsString = mockLocalStorage.getItem(key)
    expect(streakAsString).not.toBeNull()
  })

  describe('with a pre-populated streak', () => {
    let mockLocalStorage: Storage
    beforeEach(() => {
      const mockJSDom = new JSDOM('', { url: 'http://localhost' })
      mockLocalStorage = mockJSDom.window.localStorage
      //Use date in past so it's always the same
      const date = new Date('3/31/2023')
      const streak = {
        currentCount: 1,
        startDate: formattedDate(date),
        lastLoginDate: formattedDate(date)
      }
      mockLocalStorage.setItem('streak', JSON.stringify(streak))
    })
    afterEach(() => {
      mockLocalStorage.clear()
    })
    it('should return the streak from localStorage', () => {
      const date = new Date('3/31/2023')
      const streak = streakCounter(mockLocalStorage, date)

      //Should match the dates used to set up the test
      expect(streak.startDate).toBe('3/31/2023')
    })
    it('should increment the streak', () => {
      //It should increment because this is the day after
      //the streak started and a streak is days in  a row
      const date = new Date('4/01/2023')
      const streak = streakCounter(mockLocalStorage, date)

      expect(streak.currentCount).toBe(2)
    })
    it('should not increment the streak when login days is not consecutive', () => {
      //It should not increment because this is two days after
      //the streak started and the days are not consecutive
      const date = new Date('4/02/2023')
      const streak = streakCounter(mockLocalStorage, date)

      expect(streak.currentCount).toBe(1)
    })
    it('should save the incremented streak to localStorage', () => {
      const key = 'streak'
      const date = new Date('4/01/2023')
      //Call it once so it updates the streak
      streakCounter(mockLocalStorage, date)

      const streakAsString = mockLocalStorage.getItem(key)
      try {
        const streak = JSON.parse(streakAsString || '')
        expect(streak.currentCount).toBe(2)
      } catch (error) {
        fail(error)
      }
    })
    it('should reset if not consecutive', () => {
      const date = new Date('4/01/2023')
      const streak = streakCounter(mockLocalStorage, date)

      expect(streak.currentCount).toBe(2)

      // Skip a day and break the streak
      const dateUpdated = new Date('4/03/2023')
      const streakUpdated = streakCounter(mockLocalStorage, dateUpdated)

      expect(streakUpdated.currentCount).toBe(1)
    })
    it('should save the reset streak to localStorage', () => {
      const key = 'streak'
      const date = new Date('4/01/2023')
      //Call it once so it updates the streak
      streakCounter(mockLocalStorage, date)

      //Skip a day and break the streak
      const dateUpdated = new Date('4/03/2023')
      const streakUpdated = streakCounter(mockLocalStorage, dateUpdated)

      const streakAsString = mockLocalStorage.getItem(key)
      try {
        const streak = JSON.parse(streakAsString || '')
        expect(streak.currentCount).toBe(1)
      } catch (error) {
        fail(error)
      }
    })
    it('should not reset the streak for same-day login', () => {
      const date = new Date('4/01/2023')
      //Call it once so it updates the streak
      streakCounter(mockLocalStorage, date)

      // Login on the same day and the streak should not reset
      const dateUpdated = new Date('4/01/2023')
      const streakUpdated = streakCounter(mockLocalStorage, dateUpdated)

      expect(streakUpdated.currentCount).toBe(2)
    })
  })
})