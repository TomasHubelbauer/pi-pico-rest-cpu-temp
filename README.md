# Pi Pico REST CPU Temperature

In this repository, I develop a MicroPython program implementing a Pi Pico CPU
temperature probe that regularly sends the collected readings to a REST service.

The plan is to:

- Flash the Pi Pico with the MicroPython firmware
- Set up a Supabase database for storing the readings
- Set up a Deno function for persisting the readings
- Make the POST call with a JSON payload
- Run the program on in a loop to collect readings over time
- Measure power draw over a period of time for comparison
- Implement wi-fi sleep mode for power saving
- Compare power draw with the sleep mode on
- Implement wi-fi disconnect and reconnect as an alternative to wi-fi sleep
- Compare power draw with the other two solutions
