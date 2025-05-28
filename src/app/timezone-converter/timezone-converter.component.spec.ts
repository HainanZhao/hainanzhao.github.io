import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TimezoneConverterComponent } from './timezone-converter.component';

describe('TimezoneConverterComponent', () => {
  let component: TimezoneConverterComponent;
  let fixture: ComponentFixture<TimezoneConverterComponent>;
  let mockLocalStorage: { [key: string]: string };

  const mockDate = new Date('2023-10-26T10:00:00.000Z'); // UTC: 10 AM

  beforeEach(async () => {
    mockLocalStorage = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => mockLocalStorage[key] = value);
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => delete mockLocalStorage[key]);
    spyOn(localStorage, 'clear').and.callFake(() => mockLocalStorage = {});

    // Mock Date constructor and Date.now()
    jasmine.clock().install();
    jasmine.clock().mockDate(mockDate);


    await TestBed.configureTestingModule({
      imports: [ FormsModule, CommonModule, TimezoneConverterComponent ] // Import standalone component
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimezoneConverterComponent);
    component = fixture.componentInstance;
    // ngOnInit is called here by default, which calls loadPersistedTimeZones and updateTimes
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load persisted time zones on init', () => {
    mockLocalStorage['selectedTimeZones'] = JSON.stringify(['America/New_York', 'Europe/London']);
    // ngOnInit will call loadPersistedTimeZones.
    // Re-create component for this specific test case with pre-configured localStorage.
    fixture = TestBed.createComponent(TimezoneConverterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger ngOnInit

    expect(component.displayedTimeZones.length).toBe(2);
    expect(component.displayedTimeZones[0].ianaName).toBe('America/New_York');
    expect(component.displayedTimeZones[1].ianaName).toBe('Europe/London');
  });

  it('should add default time zones if none are persisted', () => {
    // Re-create component for this specific test case with empty localStorage.
    fixture = TestBed.createComponent(TimezoneConverterComponent);
    component = fixture.componentInstance;
    // Default zones are added in ngOnInit if nothing is loaded and no zones already exist.
    fixture.detectChanges(); // Trigger ngOnInit

    expect(component.displayedTimeZones.length).toBeGreaterThan(0); // Defaults should be added
    expect(component.displayedTimeZones.some(tz => tz.ianaName === 'Etc/UTC')).toBeTrue();
  });


  describe('Time Zone Management', () => {
    beforeEach(() => {
        component.displayedTimeZones = []; // Start fresh for these tests
        fixture.detectChanges();
    });

    it('should add a new time zone', () => {
      component.selectedTimeZoneToAdd = 'America/Los_Angeles';
      component.addTimeZone();
      expect(component.displayedTimeZones.length).toBe(1);
      expect(component.displayedTimeZones[0].ianaName).toBe('America/Los_Angeles');
      expect(localStorage.setItem).toHaveBeenCalledWith('selectedTimeZones', JSON.stringify(['America/Los_Angeles']));
    });

    it('should not add a duplicate time zone', () => {
      component.selectedTimeZoneToAdd = 'America/Chicago';
      component.addTimeZone(); // Add once
      component.addTimeZone(); // Try adding again
      expect(component.displayedTimeZones.length).toBe(1);
      expect(component.displayedTimeZones[0].ianaName).toBe('America/Chicago');
    });

    it('should remove a time zone', () => {
      component.selectedTimeZoneToAdd = 'Europe/Paris';
      component.addTimeZone();
      component.selectedTimeZoneToAdd = 'Asia/Tokyo';
      component.addTimeZone();
      expect(component.displayedTimeZones.length).toBe(2);

      component.removeTimeZone('Europe/Paris');
      expect(component.displayedTimeZones.length).toBe(1);
      expect(component.displayedTimeZones[0].ianaName).toBe('Asia/Tokyo');
      expect(localStorage.setItem).toHaveBeenCalledWith('selectedTimeZones', JSON.stringify(['Asia/Tokyo']));
    });
  });

  describe('Time Display', () => {
    beforeEach(() => {
      component.displayedTimeZones = [];
      fixture.detectChanges();
    });

    it('updateTimes should correctly format time for added time zones', fakeAsync(() => {
      // Mock Date is 2023-10-26T10:00:00.000Z
      component.selectedTimeZoneToAdd = 'Etc/UTC'; // UTC
      component.addTimeZone();
      component.selectedTimeZoneToAdd = 'America/New_York'; // UTC-4 at this date (EDT)
      component.addTimeZone();
      
      component.sourceDateTime = ''; // Ensure not in specific time conversion mode
      component.updateTimes(); // This will use the mocked current Date (2023-10-26T10:00:00.000Z)
      tick(1); // Process any microtasks

      const utcZone = component.displayedTimeZones.find(tz => tz.ianaName === 'Etc/UTC');
      const nyZone = component.displayedTimeZones.find(tz => tz.ianaName === 'America/New_York');

      expect(utcZone).toBeTruthy();
      expect(nyZone).toBeTruthy();

      // At 2023-10-26T10:00:00.000Z:
      // UTC: 10:00:00 AM, Thu, Oct 26, 2023. Offset: GMT
      // New York (EDT, UTC-4): 06:00:00 AM, Thu, Oct 26, 2023. Offset: GMT-4
      
      expect(utcZone?.currentTime).toBe('10:00:00 AM');
      expect(utcZone?.currentDate).toBe('Thu, Oct 26, 2023');
      expect(utcZone?.offset.toUpperCase()).toBe('GMT'); // Intl gives 'GMT', not 'GMT+0' or similar

      expect(nyZone?.currentTime).toBe('06:00:00 AM');
      expect(nyZone?.currentDate).toBe('Thu, Oct 26, 2023');
      expect(nyZone?.offset.toUpperCase()).toBe('GMT-4');
    }));
  });

  describe('Specific Time Conversion (Bonus Feature)', () => {
     beforeEach(() => {
        component.displayedTimeZones = [];
        component.selectedTimeZoneToAdd = 'America/New_York'; // Source zone for picker
        component.addTimeZone();
        component.selectedTimeZoneToAdd = 'Europe/London'; // Target zone to check
        component.addTimeZone();
        fixture.detectChanges();
    });

    it('convertFromSourceDateTime should update other zones correctly', fakeAsync(() => {
      // New York is UTC-4 (EDT), London is UTC+1 (BST) on this date
      // Difference is 5 hours.
      // If New York is 2023-10-26 07:00 AM
      // London should be 2023-10-26 12:00 PM (midday)

      component.sourceDateTime = '2023-10-26T07:00'; // 7:00 AM
      component.sourceTimeZoneForPicker = 'America/New_York';
      
      // Manually trigger the update for consistent testing, bypassing direct ngModel changes
      component.convertFromSourceDateTime();
      tick(); // allow time for internal processing of dates if any async ops were involved

      const nyZone = component.displayedTimeZones.find(tz => tz.ianaName === 'America/New_York');
      const londonZone = component.displayedTimeZones.find(tz => tz.ianaName === 'Europe/London');

      expect(nyZone).toBeTruthy();
      expect(londonZone).toBeTruthy();
      
      // Expected for New York (source, should reflect input directly if parsing allows)
      // The date parsing in component is complex; we check the outcome.
      // Input: 2023-10-26T07:00 in America/New_York
      expect(nyZone?.currentTime).toBe('07:00:00 AM');
      expect(nyZone?.currentDate).toBe('Thu, Oct 26, 2023'); // Assuming date doesn't change

      // Expected for London (NY + 5 hours)
      expect(londonZone?.currentTime).toBe('12:00:00 PM');
      expect(londonZone?.currentDate).toBe('Thu, Oct 26, 2023');
    }));

    it('should revert to live times if sourceDateTime is cleared', fakeAsync(() => {
        component.sourceDateTime = '2023-10-26T07:00';
        component.sourceTimeZoneForPicker = 'America/New_York';
        component.convertFromSourceDateTime(); // Set to specific time
        tick();

        let londonZone = component.displayedTimeZones.find(tz => tz.ianaName === 'Europe/London');
        expect(londonZone?.currentTime).toBe('12:00:00 PM'); // As per above test

        component.sourceDateTime = ''; // Clear the input
        component.onSourceDateTimeChange(); // Trigger the component's handler
        tick(); // Allow updateTimes to run if called

        // Now times should be based on mockDate (2023-10-26T10:00:00.000Z)
        // London (BST, UTC+1) should be 11:00:00 AM
        londonZone = component.displayedTimeZones.find(tz => tz.ianaName === 'Europe/London');
        expect(londonZone?.currentTime).toBe('11:00:00 AM');
    }));

  });

  describe('Persistence (localStorage)', () => {
    beforeEach(() => {
        component.displayedTimeZones = [];
        fixture.detectChanges(); // Ensure component is initialized
    });

    it('persistTimeZones should call localStorage.setItem', () => {
      component.selectedTimeZoneToAdd = 'Asia/Dubai';
      component.addTimeZone(); // This calls persistTimeZones internally
      expect(localStorage.setItem).toHaveBeenCalledWith('selectedTimeZones', JSON.stringify(['Asia/Dubai']));
    });

    it('loadPersistedTimeZones should be called on init and load data', () => {
        // localStorage.getItem is spied on.
        // For a new component instance, ngOnInit would call loadPersistedTimeZones.
        // To test loading, set localStorage, then re-create the component.
        mockLocalStorage['selectedTimeZones'] = JSON.stringify(['Africa/Cairo']);
        fixture = TestBed.createComponent(TimezoneConverterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges(); // ngOnInit will load from localStorage

        expect(localStorage.getItem).toHaveBeenCalledWith('selectedTimeZones');
        expect(component.displayedTimeZones.length).toBe(1);
        expect(component.displayedTimeZones[0].ianaName).toBe('Africa/Cairo');
    });
  });

});
