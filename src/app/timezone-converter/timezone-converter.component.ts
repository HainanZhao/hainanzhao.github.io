import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DisplayTimeZone {
  ianaName: string;
  currentTime: string;
  currentDate: string;
  offset: string; // e.g., GMT-5, GMT+9:30
}

@Component({
  selector: 'app-timezone-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timezone-converter.component.html',
  styleUrls: ['./timezone-converter.component.css']
})
export class TimezoneConverterComponent implements OnInit, OnDestroy {
  // Predefined list of common IANA time zone names
  availableTimeZones: string[] = [
    'Etc/UTC', 'Etc/GMT',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Toronto', 'America/Sao_Paulo',
    'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore',
    'Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland',
    'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Nairobi'
  ].sort(); // Keep them sorted for the dropdown

  selectedTimeZoneToAdd: string = '';
  displayedTimeZones: DisplayTimeZone[] = [];
  private timerId: any;

  // For the optional bonus feature
  sourceDateTime: string = ''; // ISO-like string e.g., "2024-05-20T10:30"
  sourceTimeZoneForPicker: string = '';

  constructor() {
    if (this.availableTimeZones.length > 0) {
      this.selectedTimeZoneToAdd = this.availableTimeZones[0];
    }
  }

  ngOnInit(): void {
    // Load saved timezones or add a default one
    this.loadPersistedTimeZones();
    if (this.displayedTimeZones.length === 0) {
      this.addDefaultTimeZones();
    }
    this.updateTimes(); // Initial update
    this.timerId = setInterval(() => this.updateTimes(), 1000); // Update every second
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  addDefaultTimeZones(): void {
    const defaults = ['Etc/UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
    defaults.forEach(tz => {
      if (!this.displayedTimeZones.find(dtz => dtz.ianaName === tz) && this.availableTimeZones.includes(tz)) {
        this.addTimeZoneToList(tz);
      }
    });
  }

  addTimeZone(): void {
    if (this.selectedTimeZoneToAdd && !this.displayedTimeZones.find(tz => tz.ianaName === this.selectedTimeZoneToAdd)) {
      this.addTimeZoneToList(this.selectedTimeZoneToAdd);
      this.persistTimeZones();
      if (this.sourceDateTime && this.sourceTimeZoneForPicker) { // If bonus feature is active, update based on it
        this.convertFromSourceDateTime();
      }
    }
  }

  private addTimeZoneToList(ianaName: string): void {
     const now = new Date();
     this.displayedTimeZones.push({
        ianaName: ianaName,
        currentTime: this.formatTime(now, ianaName),
        currentDate: this.formatDate(now, ianaName),
        offset: this.getOffset(now, ianaName)
      });
      // Set the source time zone for picker if it's the first one added
      if (this.displayedTimeZones.length === 1 && !this.sourceTimeZoneForPicker) {
        this.sourceTimeZoneForPicker = ianaName;
      }
  }

  removeTimeZone(ianaName: string): void {
    this.displayedTimeZones = this.displayedTimeZones.filter(tz => tz.ianaName !== ianaName);
    if (this.sourceTimeZoneForPicker === ianaName && this.displayedTimeZones.length > 0) {
        this.sourceTimeZoneForPicker = this.displayedTimeZones[0].ianaName; // Assign to another if it was removed
    } else if (this.displayedTimeZones.length === 0) {
        this.sourceTimeZoneForPicker = ''; // Clear if no zones left
    }
    this.persistTimeZones();
     if (this.sourceDateTime && this.sourceTimeZoneForPicker) {
        this.convertFromSourceDateTime();
    } else {
        this.updateTimes(); // Fallback to current time if bonus feature isn't active
    }
  }

  updateTimes(): void {
    // If sourceDateTime is set, don't update with current time, rely on convertFromSourceDateTime
    if (this.sourceDateTime && this.sourceTimeZoneForPicker) {
      this.convertFromSourceDateTime(); // Keep times based on picker
      return;
    }
    const now = new Date();
    this.displayedTimeZones.forEach(tz => {
      tz.currentTime = this.formatTime(now, tz.ianaName);
      tz.currentDate = this.formatDate(now, tz.ianaName);
      tz.offset = this.getOffset(now, tz.ianaName);
    });
  }

  private formatTime(date: Date, timeZone: string): string {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  }

  private formatDate(date: Date, timeZone: string): string {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  private getOffset(date: Date, timeZone: string): string {
    const options: Intl.DateTimeFormatOptions = { timeZone, timeZoneName: 'longOffset' };
    const dateTimeFormat = new Intl.DateTimeFormat('en', options);
    const parts = dateTimeFormat.formatToParts(date);
    const timeZoneNamePart = parts.find(part => part.type === 'timeZoneName');
    return timeZoneNamePart ? timeZoneNamePart.value : 'N/A'; // e.g. "GMT-4", "GMT+5:30"
  }

  // --- Optional Bonus Feature ---
  onSourceDateTimeChange(): void {
    if (this.sourceDateTime && this.sourceTimeZoneForPicker) {
      this.convertFromSourceDateTime();
    } else if (!this.sourceDateTime) { // If date-time input is cleared, revert to live times
        this.updateTimes(); // This will re-enable live updates
        // And clear the interval based updates if we want to stop live updates
        // Or just let updateTimes manage itself based on sourceDateTime presence
    }
  }

  onSourceTimeZoneChange(): void {
    if (this.sourceDateTime && this.sourceTimeZoneForPicker) {
        this.convertFromSourceDateTime();
    }
  }


  convertFromSourceDateTime(): void {
    if (!this.sourceDateTime || !this.sourceTimeZoneForPicker) {
      // If either is missing, fall back to live times for all zones
      // This will effectively "turn off" the picker's control if it's not fully configured
      const now = new Date();
      this.displayedTimeZones.forEach(tz => {
        tz.currentTime = this.formatTime(now, tz.ianaName);
        tz.currentDate = this.formatDate(now, tz.ianaName);
        tz.offset = this.getOffset(now, tz.ianaName);
      });
      return;
    }

    // Attempt to parse the local date-time string.
    // The input `this.sourceDateTime` (e.g., "2024-05-20T10:30") is assumed to be local
    // to the `this.sourceTimeZoneForPicker`.
    // To correctly convert it, we need to construct a string that JavaScript's Date parser
    // can understand as belonging to that time zone or manipulate it to UTC.

    // Step 1: Get the UTC offset for the sourceTimeZoneForPicker at the sourceDateTime.
    // This is tricky because the offset can change (DST).
    // A robust way is to format the date in the source zone and extract offset, or use a library.
    // For simplicity, we'll create a date object assuming it's UTC, then use Intl to format it
    // *as if* it were in the source timezone, then parse *that* to get a true UTC Date object.

    // This is a simplification: new Date(string) often parses as local or UTC depending on format.
    // For "YYYY-MM-DDTHH:mm", it's treated as local. We need to be more precise.
    // Let's get the current time in the source zone to find its offset, then apply to our input.
    
    const tempDateForOffset = new Date(); // Use current date to determine offset for the chosen time zone
    const offsetString = this.getOffset(tempDateForOffset, this.sourceTimeZoneForPicker); // e.g., GMT-4
    
    // Convert sourceDateTime (e.g., "2024-05-20T10:30") and offsetString (e.g., "GMT-04:00") into a Date object
    // Need to parse "GMT-04:00" into something like "-04:00"
    let offsetHours = 0;
    let offsetMinutes = 0;
    const gmtMatch = offsetString.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (gmtMatch) {
        const sign = gmtMatch[1] === '+' ? 1 : -1;
        offsetHours = sign * parseInt(gmtMatch[2], 10);
        if (gmtMatch[3]) {
            offsetMinutes = sign * parseInt(gmtMatch[3], 10);
        }
    }

    // Create a date object from sourceDateTime parts.
    // This is still tricky because Date constructor with parts is UTC.
    // `YYYY-MM-DDTHH:MM` is parsed as local.
    // The most reliable way is to use a library or construct a UTC string carefully.

    // Let's try to construct a Date object that represents the *intended* moment in time.
    // If sourceDateTime is "2024-05-20T10:30" and sourceTimeZoneForPicker is "America/New_York" (currently GMT-4)
    // this means 2024-05-20 10:30 AM EDT.
    // UTC would be 2024-05-20 14:30:00Z.

    // Simplification: Assume input `sourceDateTime` is like `new Date()` would produce if local to that zone.
    // This is hard without a library. Let's try to get the components and build a UTC date.
    const [datePart, timePart] = this.sourceDateTime.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    // Create a UTC date, then "shift" it to what it would be in the target zone.
    // This is still not quite right. The Date object itself is always UTC milliseconds.
    // The key is to create a Date object that, when formatted for `this.sourceTimeZoneForPicker`,
    // *shows* `this.sourceDateTime`.

    // Create a date object by interpreting the input string as if it's in the source time zone.
    // This requires knowing the offset of the source time zone for that specific date and time.
    // Let's use a library-like approach in pure JS (can be complex due to DST).
    // For a robust solution, a date library like `date-fns-tz` or `luxon` would be best.
    // Given the constraints, we'll make a best effort.

    // Try to create a string that includes the offset, then parse it.
    // E.g. "2024-05-20T10:30:00-04:00" for New York if offset is -4.
    // The `getOffset` we have returns "GMT-4", need to format it.
    let isoDateTimeString = this.sourceDateTime;
    if (gmtMatch) {
        const sign = gmtMatch[1];
        const hr = gmtMatch[2].padStart(2, '0');
        const min = gmtMatch[3] ? gmtMatch[3].padStart(2, '0') : '00';
        isoDateTimeString += `${sign}${hr}:${min}`; // e.g., "2024-05-20T10:30-04:00"
    } else {
         // If offset parsing fails, we can't reliably convert. Fallback to current time.
        console.warn("Could not determine offset for source time zone. Reverting to live times.");
        this.sourceDateTime = ''; // Clear to prevent re-triggering this faulty path
        this.updateTimes();
        return;
    }
    
    const sourceDateObject = new Date(isoDateTimeString);

    if (isNaN(sourceDateObject.getTime())) {
        console.error("Could not parse the source date/time string:", isoDateTimeString);
        // Optionally clear sourceDateTime or provide user feedback
        return;
    }
    
    // Now sourceDateObject is a valid Date object representing that specific moment in time (UTC).
    // We can format this Date object for all other selected time zones.
    this.displayedTimeZones.forEach(tz => {
      tz.currentTime = this.formatTime(sourceDateObject, tz.ianaName);
      tz.currentDate = this.formatDate(sourceDateObject, tz.ianaName);
      tz.offset = this.getOffset(sourceDateObject, tz.ianaName); // Offset might change for the specific date
    });
  }

  // --- Persistence ---
  private persistTimeZones(): void {
    const zoneNames = this.displayedTimeZones.map(tz => tz.ianaName);
    localStorage.setItem('selectedTimeZones', JSON.stringify(zoneNames));
  }

  private loadPersistedTimeZones(): void {
    const storedZones = localStorage.getItem('selectedTimeZones');
    if (storedZones) {
      const zoneNames: string[] = JSON.parse(storedZones);
      zoneNames.forEach(name => {
        if (this.availableTimeZones.includes(name) && !this.displayedTimeZones.find(dtz => dtz.ianaName === name)) {
          this.addTimeZoneToList(name);
        }
      });
      if (this.displayedTimeZones.length > 0 && !this.sourceTimeZoneForPicker) {
        this.sourceTimeZoneForPicker = this.displayedTimeZones[0].ianaName;
      }
    }
  }
}
